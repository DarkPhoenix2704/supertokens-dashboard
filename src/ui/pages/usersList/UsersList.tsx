import React, { useCallback, useEffect, useState } from 'react'
import { UserListCount, UserPaginationList, UserWithRecipeId } from './types'
import { fetchDataAndRedirectIf401, getApiUrl } from '../../../utils'
import AuthWrapper from '../../components/authWrapper'
import NoUsers from '../../components/noUsers/NoUsers'
import UsersListTable, { LIST_DEFAULT_LIMIT } from '../../components/usersListTable/UsersListTable'
import './UsersList.css'

export const UsersList: React.FC = () => {
  const [count, setCount] = useState<number>(0)
  const [users, setUsers] = useState<UserWithRecipeId[]>([])
  const [offset, setOffset] = useState<number>(0)
  const [nextPaginationToken, setNextPaginationToken] = useState<string>()
  const [loading, setLoading] = useState<boolean>(false)
  const loadUsers = useCallback(
    async (paginationToken?: string) => {
      setLoading(true)
      if (users[offset + LIST_DEFAULT_LIMIT] == null) {
        const data = await (paginationToken ? fetchUsers({ paginationToken }) : fetchUsers()).catch(() => null)
        if (data) {
          // store the users and pagination token
          const { users: responseUsers, nextPaginationToken } = data
          setUsers(users.concat(responseUsers))
          setNextPaginationToken(nextPaginationToken)
        }
        setLoading(false)
      }
      setOffset(paginationToken ? offset + LIST_DEFAULT_LIMIT : offset)
    },
    [offset, users]
  )
  const loadCount = useCallback(async () => {
    setLoading(true)
    const result = await fetchCount().catch(() => null)
    if (result) {
      await loadUsers()
    }
    setCount(result ? result?.count : 0)
    setLoading(false)
  }, [])
  const loadOffset = useCallback((offset: number) => setOffset(offset), [])

  useEffect(() => {
    loadCount()
  }, [loadCount])

  return (
    <div className='users-list'>
      <h1 className='users-list-title'>User Management</h1>
      <p className='text-small users-list-subtitle'>
        One place to manage all your users, revoke access and edit information according to your needs.
      </p>

      <div className='users-list-paper'>
        {users.length > 0 || loading ? (
          <UsersListTable
            users={users}
            offset={offset}
            count={count}
            nextPaginationToken={nextPaginationToken}
            goToNext={(token) => loadUsers(token)}
            offsetChange={loadOffset}
            isLoading={loading}
          />
        ) : (
          <NoUsers />
        )}
      </div>
    </div>
  )
}

const fetchUsers = async (param?: { paginationToken?: string }) => {
  const response = await fetchDataAndRedirectIf401({
    url: getApiUrl('/api/users'),
    method: 'GET',
    query: { limit: `${LIST_DEFAULT_LIMIT}`, ...param },
  })
  return response && ((await response?.json()) as UserPaginationList)
}

const fetchCount = async () => {
  const response = await fetchDataAndRedirectIf401({
    url: getApiUrl('/api/users/count'),
    method: 'GET',
  })
  return response && ((await response?.json()) as UserListCount)
}

export const UserListPage = () => (
  <AuthWrapper>
    <UsersList />
  </AuthWrapper>
)
export default UserListPage
