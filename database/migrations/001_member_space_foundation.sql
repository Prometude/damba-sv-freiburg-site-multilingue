BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================================================
-- 1. ENRICHISSEMENT DES DEMANDES D’ADHÉSION
-- =========================================================

ALTER TABLE membership_applications
ADD COLUMN IF NOT EXISTS application_status TEXT
NOT NULL DEFAULT 'pending';

ALTER TABLE membership_applications
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

ALTER TABLE membership_applications
ADD COLUMN IF NOT EXISTS reviewed_by TEXT;

ALTER TABLE membership_applications
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

ALTER TABLE membership_applications
ADD COLUMN IF NOT EXISTS member_number TEXT;

ALTER TABLE membership_applications
ADD COLUMN IF NOT EXISTS membership_status TEXT
NOT NULL DEFAULT 'pending';

ALTER TABLE membership_applications
ADD COLUMN IF NOT EXISTS member_role TEXT
NOT NULL DEFAULT 'member';

ALTER TABLE membership_applications
ADD COLUMN IF NOT EXISTS contribution_status TEXT
NOT NULL DEFAULT 'unpaid';

ALTER TABLE membership_applications
ADD COLUMN IF NOT EXISTS contribution_valid_until DATE;

ALTER TABLE membership_applications
ADD COLUMN IF NOT EXISTS account_access_status TEXT
NOT NULL DEFAULT 'not_created';

ALTER TABLE membership_applications
ADD COLUMN IF NOT EXISTS preferred_language TEXT
NOT NULL DEFAULT 'fr';

ALTER TABLE membership_applications
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

ALTER TABLE membership_applications
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;

ALTER TABLE membership_applications
ADD COLUMN IF NOT EXISTS suspension_reason TEXT;

ALTER TABLE membership_applications
DROP CONSTRAINT IF EXISTS
membership_applications_application_status_check;

ALTER TABLE membership_applications
ADD CONSTRAINT
membership_applications_application_status_check
CHECK (
  application_status IN (
    'pending',
    'approved',
    'rejected',
    'withdrawn'
  )
);

ALTER TABLE membership_applications
DROP CONSTRAINT IF EXISTS
membership_applications_membership_status_check;

ALTER TABLE membership_applications
ADD CONSTRAINT
membership_applications_membership_status_check
CHECK (
  membership_status IN (
    'pending',
    'active',
    'limited',
    'suspended',
    'inactive',
    'terminated'
  )
);

ALTER TABLE membership_applications
DROP CONSTRAINT IF EXISTS
membership_applications_member_role_check;

ALTER TABLE membership_applications
ADD CONSTRAINT
membership_applications_member_role_check
CHECK (
  member_role IN (
    'member',
    'player',
    'coach',
    'committee',
    'treasurer',
    'admin'
  )
);

ALTER TABLE membership_applications
DROP CONSTRAINT IF EXISTS
membership_applications_contribution_status_check;

ALTER TABLE membership_applications
ADD CONSTRAINT
membership_applications_contribution_status_check
CHECK (
  contribution_status IN (
    'paid',
    'unpaid',
    'overdue',
    'exempt',
    'grace_period'
  )
);

ALTER TABLE membership_applications
DROP CONSTRAINT IF EXISTS
membership_applications_account_access_status_check;

ALTER TABLE membership_applications
ADD CONSTRAINT
membership_applications_account_access_status_check
CHECK (
  account_access_status IN (
    'not_created',
    'invited',
    'active',
    'limited',
    'locked',
    'suspended',
    'disabled'
  )
);

ALTER TABLE membership_applications
DROP CONSTRAINT IF EXISTS
membership_applications_preferred_language_check;

ALTER TABLE membership_applications
ADD CONSTRAINT
membership_applications_preferred_language_check
CHECK (
  preferred_language IN ('fr', 'en', 'de')
);

CREATE UNIQUE INDEX IF NOT EXISTS
membership_applications_member_number_unique_idx
ON membership_applications (member_number)
WHERE member_number IS NOT NULL;

CREATE INDEX IF NOT EXISTS
membership_applications_status_idx
ON membership_applications (
  application_status,
  membership_status
);

CREATE INDEX IF NOT EXISTS
membership_applications_email_lower_idx
ON membership_applications (
  LOWER(email)
);

-- =========================================================
-- 2. COMPTES MEMBRES
-- =========================================================

CREATE TABLE IF NOT EXISTS member_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  member_id UUID NOT NULL UNIQUE
    REFERENCES membership_applications(id)
    ON DELETE CASCADE,

  email TEXT NOT NULL,

  password_hash TEXT,

  password_algorithm TEXT
    NOT NULL DEFAULT 'scrypt',

  email_verified_at TIMESTAMPTZ,

  password_created_at TIMESTAMPTZ,

  last_login_at TIMESTAMPTZ,

  last_login_ip TEXT,

  failed_login_count INTEGER
    NOT NULL DEFAULT 0,

  locked_until TIMESTAMPTZ,

  must_change_password BOOLEAN
    NOT NULL DEFAULT FALSE,

  created_at TIMESTAMPTZ
    NOT NULL DEFAULT NOW(),

  updated_at TIMESTAMPTZ
    NOT NULL DEFAULT NOW(),

  CHECK (failed_login_count >= 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS
member_accounts_email_lower_unique_idx
ON member_accounts (LOWER(email));

-- =========================================================
-- 3. JETONS D’ACTIVATION ET DE RÉINITIALISATION
-- =========================================================

CREATE TABLE IF NOT EXISTS member_auth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  member_account_id UUID NOT NULL
    REFERENCES member_accounts(id)
    ON DELETE CASCADE,

  token_type TEXT NOT NULL,

  token_hash TEXT NOT NULL UNIQUE,

  expires_at TIMESTAMPTZ NOT NULL,

  used_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ
    NOT NULL DEFAULT NOW(),

  created_by TEXT,

  CHECK (
    token_type IN (
      'account_activation',
      'password_reset',
      'email_verification'
    )
  )
);

CREATE INDEX IF NOT EXISTS
member_auth_tokens_account_idx
ON member_auth_tokens (
  member_account_id,
  token_type,
  expires_at
);

-- =========================================================
-- 4. SESSIONS MEMBRES
-- =========================================================

CREATE TABLE IF NOT EXISTS member_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  member_account_id UUID NOT NULL
    REFERENCES member_accounts(id)
    ON DELETE CASCADE,

  session_token_hash TEXT
    NOT NULL UNIQUE,

  created_at TIMESTAMPTZ
    NOT NULL DEFAULT NOW(),

  expires_at TIMESTAMPTZ
    NOT NULL,

  last_activity_at TIMESTAMPTZ
    NOT NULL DEFAULT NOW(),

  revoked_at TIMESTAMPTZ,

  ip_address TEXT,

  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS
member_sessions_account_idx
ON member_sessions (
  member_account_id,
  expires_at
);

CREATE INDEX IF NOT EXISTS
member_sessions_active_idx
ON member_sessions (
  expires_at
)
WHERE revoked_at IS NULL;

-- =========================================================
-- 5. ÉCRITURES FINANCIÈRES
-- =========================================================

CREATE TABLE IF NOT EXISTS member_financial_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  member_id UUID NOT NULL
    REFERENCES membership_applications(id)
    ON DELETE CASCADE,

  entry_type TEXT NOT NULL,

  title TEXT NOT NULL,

  description TEXT,

  amount_cents INTEGER NOT NULL,

  currency TEXT
    NOT NULL DEFAULT 'EUR',

  status TEXT
    NOT NULL DEFAULT 'pending',

  due_date DATE,

  paid_at TIMESTAMPTZ,

  cancelled_at TIMESTAMPTZ,

  contested_at TIMESTAMPTZ,

  contest_reason TEXT,

  decision_reference TEXT,

  regulatory_basis TEXT,

  document_url TEXT,

  created_by TEXT NOT NULL,

  created_at TIMESTAMPTZ
    NOT NULL DEFAULT NOW(),

  updated_at TIMESTAMPTZ
    NOT NULL DEFAULT NOW(),

  CHECK (
    entry_type IN (
      'contribution',
      'sanction',
      'damage_reimbursement',
      'equipment',
      'event_fee',
      'credit',
      'refund',
      'other'
    )
  ),

  CHECK (
    status IN (
      'pending',
      'partially_paid',
      'paid',
      'overdue',
      'contested',
      'cancelled'
    )
  ),

  CHECK (amount_cents >= 0),

  CHECK (currency ~ '^[A-Z]{3}$')
);

CREATE INDEX IF NOT EXISTS
member_financial_entries_member_idx
ON member_financial_entries (
  member_id,
  status,
  due_date
);

CREATE INDEX IF NOT EXISTS
member_financial_entries_type_idx
ON member_financial_entries (
  entry_type,
  created_at DESC
);

-- =========================================================
-- 6. PAIEMENTS
-- =========================================================

CREATE TABLE IF NOT EXISTS member_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  member_id UUID NOT NULL
    REFERENCES membership_applications(id)
    ON DELETE CASCADE,

  financial_entry_id UUID
    REFERENCES member_financial_entries(id)
    ON DELETE SET NULL,

  amount_cents INTEGER NOT NULL,

  currency TEXT
    NOT NULL DEFAULT 'EUR',

  payment_method TEXT NOT NULL,

  payment_reference TEXT,

  receipt_number TEXT,

  payment_date TIMESTAMPTZ
    NOT NULL DEFAULT NOW(),

  recorded_by TEXT NOT NULL,

  notes TEXT,

  created_at TIMESTAMPTZ
    NOT NULL DEFAULT NOW(),

  CHECK (amount_cents > 0),

  CHECK (
    payment_method IN (
      'cash',
      'bank_transfer',
      'card',
      'paypal',
      'mobile_money',
      'other'
    )
  ),

  CHECK (currency ~ '^[A-Z]{3}$')
);

CREATE UNIQUE INDEX IF NOT EXISTS
member_payments_receipt_number_unique_idx
ON member_payments (receipt_number)
WHERE receipt_number IS NOT NULL;

CREATE INDEX IF NOT EXISTS
member_payments_member_idx
ON member_payments (
  member_id,
  payment_date DESC
);

-- =========================================================
-- 7. DOCUMENTS RÉSERVÉS AUX MEMBRES
-- =========================================================

CREATE TABLE IF NOT EXISTS member_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  title TEXT NOT NULL,

  description TEXT,

  file_url TEXT NOT NULL,

  file_name TEXT,

  mime_type TEXT,

  audience TEXT
    NOT NULL DEFAULT 'all_members',

  is_published BOOLEAN
    NOT NULL DEFAULT TRUE,

  published_at TIMESTAMPTZ
    NOT NULL DEFAULT NOW(),

  expires_at TIMESTAMPTZ,

  uploaded_by TEXT NOT NULL,

  created_at TIMESTAMPTZ
    NOT NULL DEFAULT NOW(),

  CHECK (
    audience IN (
      'all_members',
      'players',
      'coaches',
      'committee',
      'treasurer',
      'admin'
    )
  )
);

-- =========================================================
-- 8. ANNONCES INTERNES
-- =========================================================

CREATE TABLE IF NOT EXISTS member_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  title TEXT NOT NULL,

  content TEXT NOT NULL,

  audience TEXT
    NOT NULL DEFAULT 'all_members',

  priority TEXT
    NOT NULL DEFAULT 'normal',

  published_at TIMESTAMPTZ
    NOT NULL DEFAULT NOW(),

  expires_at TIMESTAMPTZ,

  published_by TEXT NOT NULL,

  is_published BOOLEAN
    NOT NULL DEFAULT TRUE,

  created_at TIMESTAMPTZ
    NOT NULL DEFAULT NOW(),

  updated_at TIMESTAMPTZ
    NOT NULL DEFAULT NOW(),

  CHECK (
    audience IN (
      'all_members',
      'players',
      'coaches',
      'committee',
      'treasurer',
      'admin'
    )
  ),

  CHECK (
    priority IN (
      'normal',
      'important',
      'urgent'
    )
  )
);

-- =========================================================
-- 9. DEMANDES DAMBA CARE
-- =========================================================

CREATE TABLE IF NOT EXISTS member_care_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  member_id UUID NOT NULL
    REFERENCES membership_applications(id)
    ON DELETE CASCADE,

  request_type TEXT NOT NULL,

  subject TEXT NOT NULL,

  message TEXT NOT NULL,

  confidentiality_level TEXT
    NOT NULL DEFAULT 'restricted',

  status TEXT
    NOT NULL DEFAULT 'submitted',

  assigned_to TEXT,

  response_notes TEXT,

  submitted_at TIMESTAMPTZ
    NOT NULL DEFAULT NOW(),

  reviewed_at TIMESTAMPTZ,

  closed_at TIMESTAMPTZ,

  CHECK (
    request_type IN (
      'birth',
      'marriage',
      'illness',
      'death',
      'integration',
      'administrative_support',
      'financial_difficulty',
      'other'
    )
  ),

  CHECK (
    confidentiality_level IN (
      'restricted',
      'committee',
      'admin_only'
    )
  ),

  CHECK (
    status IN (
      'submitted',
      'under_review',
      'in_progress',
      'resolved',
      'rejected',
      'closed'
    )
  )
);

CREATE INDEX IF NOT EXISTS
member_care_requests_member_idx
ON member_care_requests (
  member_id,
  submitted_at DESC
);

-- =========================================================
-- 10. JOURNAL DES ACTIONS
-- =========================================================

CREATE TABLE IF NOT EXISTS member_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  actor_type TEXT NOT NULL,

  actor_identifier TEXT NOT NULL,

  action TEXT NOT NULL,

  entity_type TEXT NOT NULL,

  entity_id TEXT,

  details JSONB
    NOT NULL DEFAULT '{}'::jsonb,

  ip_address TEXT,

  created_at TIMESTAMPTZ
    NOT NULL DEFAULT NOW(),

  CHECK (
    actor_type IN (
      'member',
      'admin',
      'system'
    )
  )
);

CREATE INDEX IF NOT EXISTS
member_audit_logs_entity_idx
ON member_audit_logs (
  entity_type,
  entity_id,
  created_at DESC
);

CREATE INDEX IF NOT EXISTS
member_audit_logs_actor_idx
ON member_audit_logs (
  actor_type,
  actor_identifier,
  created_at DESC
);

COMMIT;
