import { Fragment, type ReactNode } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: ReactNode
  side?: 'left' | 'right' | 'top' | 'bottom'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-4xl'
}

const sideClasses = {
  left: 'left-0 top-0 bottom-0',
  right: 'right-0 top-0 bottom-0',
  top: 'top-0 left-0 right-0',
  bottom: 'bottom-0 left-0 right-0'
}

export default function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  side = 'right',
  size = 'md'
}: DrawerProps) {
  const isVertical = side === 'left' || side === 'right'
  
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className={cn(
            'absolute inset-y-0 overflow-y-auto p-4',
            sideClasses[side],
            isVertical ? 'w-full max-w-md' : ''
          )}>
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-out duration-300"
              enterFrom={side === 'right' ? 'translate-x-full' : side === 'left' ? '-translate-x-full' : side === 'top' ? '-translate-y-full' : 'translate-y-full'}
              enterTo="translate-x-0"
              leave="transform transition ease-in duration-200"
              leaveFrom="translate-x-0"
              leaveTo={side === 'right' ? 'translate-x-full' : side === 'left' ? '-translate-x-full' : side === 'top' ? '-translate-y-full' : 'translate-y-full'}
            >
              <Dialog.Panel
                className={cn(
                  'w-full transform overflow-hidden rounded-l-xl bg-white shadow-xl transition-all h-full',
                  isVertical ? sizeClasses[size] : 'w-full',
                  side === 'left' && 'rounded-r-xl',
                  side === 'right' && 'rounded-l-xl'
                )}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-4 border-b">
                    <div>
                      {title && (
                        <Dialog.Title className="text-lg font-semibold text-gray-900">
                          {title}
                        </Dialog.Title>
                      )}
                      {description && (
                        <Dialog.Description className="mt-1 text-sm text-gray-500">
                          {description}
                        </Dialog.Description>
                      )}
                    </div>
                    <button
                      onClick={onClose}
                      className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-auto p-4">
                    {children}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}