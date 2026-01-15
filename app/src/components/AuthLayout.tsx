import Link from 'next/link'
import React from 'react'

type AuthLayoutProps = {
  leftTitle: string
  leftSubtitle: string
  rightTitle: string
  children: React.ReactNode
}

export default function AuthLayout({
  leftTitle,
  leftSubtitle,
  rightTitle,
  children,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      
      <div className="hidden md:flex md:w-1/2 lg:w-2/5 bg-slate-900 text-white p-12 flex-col justify-between">
        <div className="text-2xl font-bold">JASP</div>
        <div>
          <h1 className="text-3xl font-bold">{leftTitle}</h1>
          <p className="text-slate-300 mt-4 text-sm">{leftSubtitle}</p>
        </div>
        <div className="text-sm text-slate-400">
          © {new Date().getFullYear()} JASP. All rights reserved.
        </div>
      </div>

      
      <div className="w-full md:w-1/2 lg:w-3/5 bg-gray-50 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-gray-900">{rightTitle}</h2>
          {children}
        </div>
      </div>
    </div>
  )
}