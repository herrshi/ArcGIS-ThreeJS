import {
  declared,
  property,
  subclass
} from "esri/core/accessorSupport/decorators";
import Accessor from "esri/core/Accessor";
import Extent from "esri/geometry/Extent";

@subclass("TGIS.BookmarkItem")
class BookmarkItem extends declared(Accessor) {
  @property() active = false;

  @property({
    type: Extent
  })
  extent: Extent;

  @property() name: string;
}

export = BookmarkItem;
