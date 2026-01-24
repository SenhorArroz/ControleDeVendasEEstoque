"use client";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function SignOutButton() {
	return (
		<button
			onClick={() => signOut({ callbackUrl: "/login" })}
			className="text-error hover:bg-error/10"
		>
			<LogOut className="w-5 h-5" /> Sair
		</button>
	);
}
