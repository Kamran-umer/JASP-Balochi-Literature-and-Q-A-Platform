import { LucideIcon } from 'lucide-react'

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  Icon: LucideIcon
}

export default function Input({ Icon, ...props }: InputProps) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        {...props}
        dir="auto"
        className="w-full ps-10 pe-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-start"
      />
    </div>
  )
}