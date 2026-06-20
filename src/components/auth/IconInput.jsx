import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Labelled input with a leading icon — the repeated field pattern across the
 * auth forms. `labelRight` is an optional slot for e.g. a "Forgot password?"
 * link. Remaining props are forwarded to the underlying Input.
 */
export default function IconInput({ id, label, icon, labelRight, className = '', ...inputProps }) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-sm font-medium text-blue-100">
          {label}
        </Label>
        {labelRight}
      </div>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300">{icon}</div>
        <Input
          id={id}
          className={`h-10 text-sm pl-10 pr-4 bg-[#131631] border-blue-900/30 text-white placeholder:text-blue-300/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all rounded-xl ${className}`}
          {...inputProps}
        />
      </div>
    </div>
  );
}
