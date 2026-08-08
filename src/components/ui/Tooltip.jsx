import { useState, useRef, useEffect, useCallback, isValidElement, cloneElement } from 'react'
import { createPortal } from 'react-dom'

export function Tooltip({
  children,
  content,
  position = 'top',
  delay = 150,
  leaveDelay = 100,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [triggerRect, setTriggerRect] = useState(null)
  const triggerRef = useRef(null)
  const tooltipRef = useRef(null)
  const openTimerRef = useRef(null)
  const closeTimerRef = useRef(null)

  const clearTimers = useCallback(() => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current)
      openTimerRef.current = null
    }
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  const handleOpen = useCallback(() => {
    clearTimers()
    openTimerRef.current = setTimeout(() => {
      if (triggerRef.current) {
        setTriggerRect(triggerRef.current.getBoundingClientRect())
      }
      setIsOpen(true)
    }, delay)
  }, [clearTimers, delay])

  const handleClose = useCallback(() => {
    clearTimers()
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false)
      setTriggerRect(null)
    }, leaveDelay)
  }, [clearTimers, leaveDelay])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      handleClose()
    }
  }, [handleClose])

  useEffect(() => {
    return () => clearTimers()
  }, [clearTimers])

  const child = Array.isArray(children) ? children[0] : children

  const trigger = child && isValidElement(child) ? cloneElement(child, {
    ref: triggerRef,
    onMouseEnter: handleOpen,
    onMouseLeave: handleClose,
    onFocus: handleOpen,
    onBlur: handleClose,
    onKeyDown: handleKeyDown,
    'aria-describedby': isOpen && triggerRect ? 'tooltip-content' : undefined,
    tabIndex: -1,
  }) : child

  if (!isOpen || !triggerRect) {
    return trigger
  }

  const tooltipId = 'tooltip-content'
  const positions = {
    top: {
      top: triggerRect.top + window.scrollY - 8,
      left: triggerRect.left + window.scrollX + triggerRect.width / 2,
      transform: 'translateX(-50%) translateY(-100%)',
      arrowPos: 'bottom',
      arrowLeft: '50%',
      arrowTransform: 'translateX(-50%) rotate(45deg)',
    },
    bottom: {
      top: triggerRect.bottom + window.scrollY + 8,
      left: triggerRect.left + window.scrollX + triggerRect.width / 2,
      transform: 'translateX(-50%)',
      arrowPos: 'top',
      arrowLeft: '50%',
      arrowTransform: 'translateX(-50%) rotate(45deg)',
    },
    left: {
      top: triggerRect.top + window.scrollY + triggerRect.height / 2,
      left: triggerRect.left + window.scrollX - 8,
      transform: 'translateY(-50%) translateX(-100%)',
      arrowPos: 'right',
      arrowTop: '50%',
      arrowTransform: 'translateY(-50%) rotate(45deg)',
    },
    right: {
      top: triggerRect.top + window.scrollY + triggerRect.height / 2,
      left: triggerRect.right + window.scrollX + 8,
      transform: 'translateY(-50%)',
      arrowPos: 'left',
      arrowTop: '50%',
      arrowTransform: 'translateY(-50%) rotate(45deg)',
    },
  }

  const pos = positions[position] || positions.top

  const tooltipContent = (
    <div
      ref={tooltipRef}
      id={tooltipId}
      role="tooltip"
      className={`tooltip-content ${className}`}
      style={{
        top: pos.top,
        left: pos.left,
        transform: pos.transform,
      }}
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
      tabIndex={-1}
    >
      <div className="tooltip-inner">{content}</div>
      <div
        className={`tooltip-arrow ${pos.arrowPos}`}
        style={{
          [pos.arrowLeft ? 'left' : 'top']: pos.arrowLeft || pos.arrowTop,
          transform: pos.arrowTransform,
        }}
      />
    </div>
  )

  return (
    <>
      {trigger}
      {createPortal(tooltipContent, document.body)}
    </>
  )
}