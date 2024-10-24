import mongoose from "mongoose";

const futsalSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FutsalOwner'
      }
}, { strict: false });

const Futsal = mongoose.model("FutsalVenue", futsalSchema);

export default Futsal;
