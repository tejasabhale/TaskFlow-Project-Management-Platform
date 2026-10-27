import { Activity } from "../models/activity.model.js";

export const createActivity = async ({
  user,
  workspace,
  project,
  task,
  action,
}) => {
  return await Activity.create({
    user,
    workspace,
    project,
    task,
    action,
  });
};
