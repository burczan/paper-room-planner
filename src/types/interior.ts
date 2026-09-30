// ============
// Interior

interface Room {
  readonly widthMm: number;
  readonly lengthMm: number;
}

export interface RectangularItem {
  readonly name: string;
  readonly shape: "rectangle";
  readonly widthMm: number;
  readonly lengthMm: number;
}

export type Item = RectangularItem;

export interface Interior {
  readonly room: Room;
  readonly items: readonly Item[];
}

// ============
// Room Scale

export interface RealWorldRoomDimensionsMm {
  readonly widthMm: number;
  readonly lengthMm: number;
}

export type PageOrientation = "portrait" | "landscape";

export interface PageSize {
  readonly widthMm: number;
  readonly heightMm: number;
}

export interface RoomScaleResult {
  readonly pageOrientation: PageOrientation;
  readonly scaleDenominator: number;
  readonly availablePageWidthMm: number;
  readonly availablePageHeightMm: number;
  readonly roomWidthOnPageMm: number;
  readonly roomHeightOnPageMm: number;
}

// ============
// Document Pages

export interface RectangularRoomShapePlacement {
  readonly shape: "rectangle";
  readonly xMm: number;
  readonly yMm: number;
  readonly widthMm: number;
  readonly heightMm: number;
}

export type RoomShapePlacement = RectangularRoomShapePlacement;

export interface RoomPage {
  readonly kind: "room";
  readonly pageOrientation: PageOrientation;
  readonly roomShapePlacement: RoomShapePlacement;
}

export interface ItemPage {
  readonly kind: "item";
  readonly pageOrientation: "landscape";
  readonly itemPageIndex: number;
  readonly hasCalibrationReference: boolean;
  readonly cutoutPlacements: readonly ItemCutoutPlacement[];
}

export type DocumentPage = RoomPage | ItemPage;

export interface DocumentPlan {
  readonly scale: RoomScaleResult;
  readonly pages: readonly DocumentPage[];
}

// ============
// Item Cutout Placement
export interface ItemCutout {
  readonly name: string;
  readonly realWorldWidthMm: number;
  readonly realWorldLengthMm: number;
  readonly widthMm: number;
  readonly heightMm: number;
}

export interface ItemCutoutPlacement extends ItemCutout {
  readonly pageIndex: number;
  readonly xMm: number;
  readonly yMm: number;
}

export interface ItemCutoutPlacementPlan {
  readonly scaleDenominator: number;
  readonly pageCount: number;
  readonly cutoutPlacements: readonly ItemCutoutPlacement[];
}
