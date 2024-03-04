import getIsAdmin from '../organization/getIsAdmin'

import getUser from './getUser'

// const deletePrismaUser = (id: number) =>
//   prisma.user.update({
//     where: {
//       id,
//     },
//     data: {
//       isDeleted: true
//     },
//   })

const deleteUser = async (userId: string) => {
  const user = await getUser(userId)
  if (!user) return false
  const orgId = user.org?.id
  if (orgId) {
    const isAdmin = await getIsAdmin(orgId, user.id)
    if (isAdmin) {
      console.log('Deleting Not Implemented')
      // const deleteOrg = prisma.organization.update({
      //   where: {
      //     id: orgId,
      //   },
      //   data: {
      //     isDeleted: true,
      //   },
      // })
      // const deleteUser = deletePrismaUser(user.id)
      // await prisma.$transaction([deleteOrg, deleteUser])
    }
  } else {
    console.log('Deleting Not Implemented')
    // await deletePrismaUser(user.id)
  }
  return true
}

export default deleteUser
