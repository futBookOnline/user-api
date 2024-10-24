import mongoose from "mongoose";

const futsalOwnerSchema = mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "FutsalOwner" },
  },
  { strict: false }
);

const FutsalOwner = mongoose.model("FutsalOwner", futsalOwnerSchema);
export default FutsalOwner;
