'use client'

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'

import AppHeader from '@/components/ui/app-header'

interface User {
  id: number
  email: string
  name: string | null
  role: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    role: 'USER',
    active: true
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') {
      if (session?.user?.role !== 'ADMIN') {
        router.push('/')
      } else {
        fetchUsers()
      }
    }
  }, [session, status, router])

  const fetchUsers = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/users')

      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      const data = await response.json()
      setUsers(data.users)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user')
      }

      setShowCreateModal(false)
      setFormData({ email: '', name: '', password: '', role: 'USER', active: true })
      fetchUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    setIsSubmitting(true)
    setError(null)

    try {
      const updateData: Record<string, string | boolean> = {
        email: formData.email,
        name: formData.name,
        role: formData.role,
        active: formData.active
      }

      if (formData.password) {
        updateData.password = formData.password
      }

      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user')
      }

      setEditingUser(null)
      setFormData({ email: '', name: '', password: '', role: 'USER', active: true })
      fetchUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user')
      }

      fetchUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user')
    }
  }

  const openEditModal = (user: User) => {
    setEditingUser(user)
    setFormData({
      email: user.email,
      name: user.name || '',
      password: '',
      role: user.role,
      active: user.active
    })
  }

  if (status === 'loading' || (status === 'authenticated' && isLoading)) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold mb-4'>Loading...</h1>
        </div>
      </div>
    )
  }

  if (session?.user?.role !== 'ADMIN') {
    return null
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors'>
      <AppHeader />

      <main className='max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-6 flex justify-between items-center'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
              User Management
            </h1>
            <p className='text-gray-600 dark:text-gray-400 mt-1'>
              Manage system users and their permissions
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className='bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-4 py-2 rounded-md font-medium transition-colors'
          >
            Create User
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className='mb-6 p-4 rounded-md bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700'>
            {error}
          </div>
        )}

        {/* Users Table */}
        <div className='bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden'>
          {users.length === 0 ? (
            <div className='text-center py-12 text-gray-500 dark:text-gray-400'>
              No users found
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
                <thead className='bg-gray-50 dark:bg-gray-700'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                      Email
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                      Name
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                      Role
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                      Status
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                      Created
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className='hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
                    >
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white'>
                        {user.email}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                        {user.name || '-'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm'>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'ADMIN'
                              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm'>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.active
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                          }`}
                        >
                          {user.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                        {new Date(user.createdAt).toLocaleDateString('en-GB')}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm space-x-2'>
                        <button
                          onClick={() => openEditModal(user)}
                          className='text-blue-600 dark:text-blue-400 hover:underline'
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className='text-red-600 dark:text-red-400 hover:underline'
                          disabled={user.id.toString() === session.user.id}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingUser) && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full'>
            <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-4'>
              {editingUser ? 'Edit User' : 'Create User'}
            </h2>

            <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser}>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Email *
                  </label>
                  <input
                    type='email'
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Name
                  </label>
                  <input
                    type='text'
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Password {editingUser && '(leave blank to keep current)'}
                  </label>
                  <input
                    type='password'
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required={!editingUser}
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                  >
                    <option value='USER'>User</option>
                    <option value='ADMIN'>Admin</option>
                  </select>
                </div>

                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='active'
                    checked={formData.active}
                    onChange={(e) =>
                      setFormData({ ...formData, active: e.target.checked })
                    }
                    className='h-4 w-4 text-blue-600 border-gray-300 rounded'
                  />
                  <label
                    htmlFor='active'
                    className='ml-2 text-sm text-gray-700 dark:text-gray-300'
                  >
                    Active
                  </label>
                </div>
              </div>

              <div className='mt-6 flex gap-3'>
                <button
                  type='button'
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingUser(null)
                    setFormData({
                      email: '',
                      name: '',
                      password: '',
                      role: 'USER',
                      active: true
                    })
                  }}
                  className='flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={isSubmitting}
                  className='flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:bg-blue-300 dark:disabled:bg-blue-600'
                >
                  {isSubmitting
                    ? 'Saving...'
                    : editingUser
                      ? 'Update'
                      : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
