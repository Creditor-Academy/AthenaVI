import { useEffect, useState } from 'react'

export function pptDaypartFromHour(hour) {
  if (hour >= 4 && hour < 11) return 'morning'
  if (hour >= 11 && hour < 16) return 'afternoon'
  if (hour >= 16 && hour < 20) return 'evening'
  return 'night'
}

export function usePptDaypart() {
  const [part, setPart] = useState(() => pptDaypartFromHour(new Date().getHours()))
  useEffect(() => {
    const sync = () => setPart(pptDaypartFromHour(new Date().getHours()))
    const id = window.setInterval(sync, 60_000)
    return () => window.clearInterval(id)
  }, [])
  return part
}
