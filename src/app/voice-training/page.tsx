import { redirect } from "next/navigation";

/** Legacy route: Voice Training was renamed to Listing Style Selection. */
export default function VoiceTrainingPage() {
  redirect("/listing-style-selection");
}
