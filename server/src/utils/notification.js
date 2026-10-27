import { Notification } from "../models/notification.model.js";

export const createNotification = async ({
  recipient,
  sender,
  title,
  message,
  type,
  task,
  project,
  workspace,
}) => {
  return await Notification.create({
    recipient,
    sender,
    title,
    message,
    type,
    task,
    project,
    workspace,
  });
};
