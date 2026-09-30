import { jsPDF } from "jspdf";
import { millimetresToMetres } from "./utils.js";
import type {
  Interior,
  RoomShapePlacement,
  RoomPage,
} from "../types/interior.js";
import { roomStyle } from "./style.js";

function calculateRoomDimensionsLabelCoordinates(
  roomShapePlacement: RoomShapePlacement,
) {
  return {
    contentStartXCoordinateMm:
      roomShapePlacement.xMm + roomStyle.innerPaddingLeftMm,
    roomDimensionsYCoordinateMm:
      roomShapePlacement.yMm + roomStyle.innerPaddingTopMm,
  };
}

export function drawRoomPage(
  pdf: jsPDF,
  interior: Interior,
  roomPage: RoomPage,
): void {
  const { room } = interior;
  const { roomShapePlacement } = roomPage;
  const roomDimensionsLabelCoordinates =
    calculateRoomDimensionsLabelCoordinates(roomPage.roomShapePlacement);

  pdf.setFontSize(roomStyle.fontSizePt);

  pdf.rect(
    roomShapePlacement.xMm,
    roomShapePlacement.yMm,
    roomShapePlacement.widthMm,
    roomShapePlacement.heightMm,
  );

  pdf.text(
    `Room: ${millimetresToMetres(room.widthMm)} × ${millimetresToMetres(room.lengthMm)} m`,
    roomDimensionsLabelCoordinates.contentStartXCoordinateMm,
    roomDimensionsLabelCoordinates.roomDimensionsYCoordinateMm,
  );
}
