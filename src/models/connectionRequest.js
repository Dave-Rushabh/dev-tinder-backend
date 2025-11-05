import mongoose from "mongoose";

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // refers to the _id of the User collections
      required: [true, "From User ID is required"],
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // refers to the _id of the User collections
      required: [true, "To User ID is required"],
    },
    status: {
      type: String,
      enum: {
        values: ["ignored", "interested", "rejected", "accepted"],
        message: `{VALUE} is not a valid status`,
      },
    },
  },
  { timestamps: true }
);

connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });

const connectionRequestModel = mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema
);

export default connectionRequestModel;
