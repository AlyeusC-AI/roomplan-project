import { format, getHours } from "date-fns";

const INTERVALS = {
  0: true, // 12 AM
  5: true, // 5 AM
  12: true, // 12 PM
  16: true, // 4 PM
  21: true, // 9 PM
};

const MIDNIGHT = 0;
const FIVE_AM = 5;
const TWELVE_PM = 12;
const FOUR_PM = 16;
const NINE_PM = 21;

const hourList = [FIVE_AM, TWELVE_PM, FOUR_PM, NINE_PM];

const getNextDate = (hour: number) => {
  const t = new Date(Date.now());
  t.setHours(hour);
  t.setMinutes(0);
  t.setSeconds(0);
  t.setMilliseconds(0);
  return t.getTime();
};

export const getQueueTime = () => {
  const now = Date.now();
  const hours = getHours(now);
  let hour;
  for (const h of hourList) {
    if (hours < h) {
      hour = h;
      break;
    }
  }
  if (!hour) {
    hour = MIDNIGHT;
  }
  return getNextDate(hour);
};

const queueInference = async (inferenceId: number) => {
  const processAt = getQueueTime();
  console.log(
    "Queueing inference ID - ",
    inferenceId,
    " to be processed at ",
    format(new Date(processAt), "PPpp")
  );

  // QSTASH WANTS TIMESTAMP IN SECONDS
  const qstashRes = await fetch(
    `${process.env.QSTASH_PUBLISH_URL}${process.env.IDENTISHOT_DETECTION_PROCESSING_URL}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.QSTASH_AUTHORIZATION_TOKEN}`,
        // 'Upstash-Not-Before': `${processAt / 1000}`,
      },
      body: JSON.stringify({
        inferenceId: inferenceId,
      }),
    }
  );
  if (!qstashRes.ok) {
    console.error(qstashRes);
  }
};

export default queueInference;
