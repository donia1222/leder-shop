"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { UserProfile } from "@/components/user-profile"

function ProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const back = searchParams.get("back")

  return (
    <UserProfile
      onClose={() => back ? router.push(back) : router.back()}
      onAccountDeleted={() => router.push("/")}
    />
  )
}

export default function ProfilePage() {
  return (
    <Suspense>
      <ProfileContent />
    </Suspense>
  )
}
