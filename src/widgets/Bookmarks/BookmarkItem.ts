import {
  declared,
  property,
  subclass
} from "esri/core/accessorSupport/decorators";
import Accessor from "esri/core/Accessor";
import Extent from "esri/geometry/Extent";

@subclass("TGIS.BookmarkItem")
export default class BookmarkItem extends declared(Accessor) {
  @property() active = false;

  @property({
    type: Extent
  })
  extent: Extent;

  @property() name: string;
}
