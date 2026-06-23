import { createContext, useContext, useEffect, useState } from 'react'

const ToastContext = createContext(null)

const defaultDuration = 4200

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  function removeToast(toastId) {
    setToasts((previousToasts) =>
      previousToasts.filter((toast) => toast.id !== toastId)
    )
  }

  function showToast({
    message,
    type = 'success',
    duration = defaultDuration,
  }) {
    const toastId = `${Date.now()}-${Math.random()}`

    const newToast = {
      id: toastId,
      message,
      type,
    }

    setToasts((previousToasts) => [
      ...previousToasts,
      newToast,
    ])

    if (duration > 0) {
      window.setTimeout(() => {
        removeToast(toastId)
      }, duration)
    }

    return toastId
  }

  useEffect(() => {
    return () => {
      setToasts([])
    }
  }, [])

  return (
    <ToastContext.Provider
      value={{
        showToast,
        removeToast,
      }}
    >
      {children}

      <div
        className="toast-viewport"
        aria-live="polite"
        aria-relevant="additions"
      >
        {toasts.map((toast) => (
          <article
            key={toast.id}
            className={`app-toast app-toast-${toast.type}`}
            role={toast.type === 'error' ? 'alert' : 'status'}
          >
            <div className="app-toast-icon">
              <i
                className={`bi ${
                  toast.type === 'error'
                    ? 'bi-exclamation-circle-fill'
                    : toast.type === 'warning'
                      ? 'bi-exclamation-triangle-fill'
                      : toast.type === 'info'
                        ? 'bi-info-circle-fill'
                        : 'bi-check-circle-fill'
                }`}
              ></i>
            </div>

            <p>{toast.message}</p>

            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              aria-label="Zatvori obaveštenje"
              title="Zatvori"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </article>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error(
      'useToast mora da se koristi unutar ToastProvider komponente.'
    )
  }

  return context
}