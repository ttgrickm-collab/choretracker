// frontend/src/components/FuelIcon.jsx
// Custom rocket fuel icon component (green glowing droplet)

export default function FuelIcon() {
  return (
    <span className="relative inline-flex w-6 h-6">
      {/* Outer glow */}
      <span className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full blur-md opacity-75 animate-pulse" />
      {/* Fuel container */}
      <span className="relative inline-flex items-center justify-center w-full h-full bg-gradient-to-br from-green-400 to-emerald-600 rounded-full shadow-lg">
        {/* Fuel droplet/liquid inside */}
        <span className="w-2.5 h-3.5 bg-gradient-to-b from-green-200 to-green-300 rounded-full opacity-90" />
      </span>
    </span>
  );
}
