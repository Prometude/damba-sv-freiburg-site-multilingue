"use client";
import { ReactNode } from "react";
export default function OpenMembershipButton({children,className="btn"}:{children:ReactNode,className?:string}){return <button type="button" className={className} onClick={()=>window.dispatchEvent(new Event("open-membership-modal"))}>{children}</button>}
