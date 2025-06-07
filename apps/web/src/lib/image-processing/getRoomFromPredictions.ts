// const getRoomFromPredictions = (
//   predictions: {
//     [key: string]: { confidence: number }
//   },
//   threshold: number
// ) => {
//   console.log(predictions)
//   let highestConfidence = threshold
//   let room
//   for (let i = 0; i < Object.keys(predictions).length; i++) {
//     const prediction = Object.keys(predictions)[i]
//     if (
//       prediction.indexOf('Room-') === 0 &&
//       predictions[prediction].confidence >= highestConfidence
//     ) {
//       room = prediction
//       highestConfidence = predictions[prediction].confidence
//     }
//   }

//   if (room) {
//     room = room.substring('Room-'.length).trim()
//   }

//   return room
// }

// export default getRoomFromPredictions
