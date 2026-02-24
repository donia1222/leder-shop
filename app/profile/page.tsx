"use client"

import { useRouter } from "next/navigation"
import { UserProfile } from "@/components/user-profile"

export default function ProfilePage() {
  const router = useRouter()

  return (
    <UserProfile
      onClose={() => router.back()}
      onAccountDeleted={() => router.push("/")}
    />
  )
}
