import { Composition } from "remotion";
import { PromoVideo } from "./PromoVideo";

export const Root = () => {
  return (
    <>
      <Composition
        id="GasAjaPromo"
        component={PromoVideo}
        durationInFrames={1200}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
