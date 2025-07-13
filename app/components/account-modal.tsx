"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function AccountModal() {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-center text-2xl font-light" style={{ fontFamily: "serif" }}>
          My Account
        </DialogTitle>
      </DialogHeader>
      <div className="mt-6">
        <p className="text-gray-600 text-center mb-8">Login or Register</p>
        <div className="space-y-4 mb-8">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" className="mt-1" />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <Button
            className="bg-[#2d5a4f] hover:bg-[#1e3d35] text-white py-3 rounded-full"
            style={{ fontFamily: "serif" }}
          >
            Login
          </Button>
          <Button
            variant="outline"
            className="border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37]/10 py-3 rounded-full bg-transparent"
            style={{ fontFamily: "serif" }}
          >
            Register
          </Button>
        </div>
      </div>
    </>
  )
}
