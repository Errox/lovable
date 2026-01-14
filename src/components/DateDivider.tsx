import React from 'react'

interface DateDividerProps {
  date: Date
}

export const DateDivider: React.FC<DateDividerProps> = ({ date }) => {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  let dateText: string

  if (date.toDateString() === today.toDateString()) {
    dateText = 'Vandaag'
  } else if (date.toDateString() === yesterday.toDateString()) {
    dateText = 'Gisteren'
  } else {
    dateText = date.toLocaleDateString('nl-NL', {
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
