const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * 
 * @param {string} email 
 */
module.exports.getUserByEmail = async (email) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email
      },
      include: {
        notifications: true
      }
    });

    if (!user) throw "This user is not registered yet";

    return user.notifications;
  } catch (err) {
    console.log(err);
  }
}

/**
 * 
 * @param {number} sender 
 * @param {number} recipient
 * @param {string} type
 * @param {string} description
 * @param {number} postId
 */
module.exports.sendNotification = async (senderId, recipientId, type, description, postId) => {
  const notif = await prisma.notification.findFirst({
    where: {
      type: {
        equals: type
      },
      senderId: {
        equals: senderId
      }
    }
  })

  if (notif) return null;

  const newNotification = await prisma.notification.create({
    data: {
      recipientId,
      senderId,
      type,
      postId,
      createdAt: new Date(),
      description
    }
  });

  return newNotification;
}

/**
 * 
 * @param {{ senderId: number, recipientId: number, type: string, sender: string, recipient: string }} data 
 */
module.exports.handleLike = async (data) => {
  const notification = await this.sendNotification(data.senderId, data.recipientId, data.type, `${sender} has liked your post`)
}