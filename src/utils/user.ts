// admin > shopstaff > user
const getTopRole = (roles): string => {
  const topRole = undefined;
  if (roles) {
    for (let i = 0; i < roles.length; i++) {
      const { name } = roles[i];
      if (name === 'admin') {
        return 'admin';
      }
    }

    for (let i = 0; i < roles.length; i++) {
      const { name } = roles[i];
      if (name === 'shopstaff') {
        return 'shopstaff';
      }
    }

    for (let i = 0; i < roles.length; i++) {
      const { name } = roles[i];
      if (name === 'user') {
        return 'user';
      }
    }
  }
  return topRole;
};

const getUserIds = (eventCommissions): string[] => {
  // let userIds = [];
  const {
    commissions: { invitors, participators }
  } = eventCommissions;
  const invitorUserIds = invitors.map(_ => {
    const {
      user: { _id: userId }
    } = _;
    return userId;
  });
  const participatorUserIds = participators.map(_ => {
    const {
      user: { _id: userId }
    } = _;
    return userId;
  });

  return invitorUserIds.concat(participatorUserIds);
};

export { getTopRole, getUserIds };
