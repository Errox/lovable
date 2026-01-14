import React from 'react'
import { DATE_LABELS, DEFAULT_LOCALE } from '../lib/constants'

interface DateDividerProps {
  date: Date
}

export const DateDivider: React.FC<DateDividerProps> = ({ date }) => {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  let dateText: string

  if (date.toDateString() === today.toDateString()) {
    dateText = DATE_LABELS.today
  } else if (date.toDateString() === yesterday.toDateString()) {
    dateText = DATE_LABELS.yesterday
  } else {
    dateText = date.toLocaleDateString(DEFAULT_LOCALE, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="date-divider">
      <span>{dateText}</span>
    </div>
  )
}
