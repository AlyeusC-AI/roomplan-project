import { prisma } from "../../";

import { isNullOrUndefined } from "@restorationx/utils/isNullOrUndefined";

const updateUser = async ({
  id,
  firstName,
  lastName,
  phone,
}: {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
}) => {
  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(!isNullOrUndefined(firstName) ? { firstName } : {}),
      ...(!isNullOrUndefined(lastName) ? { lastName } : {}),
      ...(!isNullOrUndefined(phone) ? { phone } : {}),
    },
  });
  return user;
};

export default updateUser;
