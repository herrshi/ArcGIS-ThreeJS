import {
  declared,
  property,
  subclass
} from "esri/core/accessorSupport/decorators";
import Accessor from "esri/core/Accessor";
import Handles from "esri/core/Handles";
import watchUtils from "esri/core/watchUtils";
import promiseUtils from "esri/core/promiseUtils";

import Collection from "esri/core/Collection";
import BookmarkItem from "@/widgets/Bookmarks/BookmarkItem";

import SceneView from "esri/views/SceneView";
import EsriMap from "esri/Map";

const BookmarkItemCollection = Collection.ofType<BookmarkItem>(BookmarkItem);

type State = "ready" | "loading" | "disabled";

@subclass("TGIS.BookmarksViewModel")
export default class BookmarksViewModel extends declared(Accessor) {
  //--------------------------------------------------------------------------
  //
  //  Lifecycle
  //
  //--------------------------------------------------------------------------

  initialize(): void {
    this._handles.add(
      watchUtils.init(this, "view", view => this._viewUpdated(view))
    );
  }

  destroy(): void {
    this._handles.destroy();
    this.bookmarkItems.removeAll();
  }

  //--------------------------------------------------------------------------
  //
  //  Variables
  //
  //--------------------------------------------------------------------------

  private _handles: Handles = new Handles();

  //--------------------------------------------------------------------------
  //
  //  Properties
  //
  //--------------------------------------------------------------------------

  //----------------------------------
  //  bookmarkItems
  //----------------------------------
  @property({
    type: BookmarkItemCollection
  })
  bookmarkItems: Collection<BookmarkItem> = new BookmarkItemCollection();

  //----------------------------------
  //  state
  //----------------------------------
  @property({
    dependsOn: ["view.ready"],
    readOnly: true
  })
  get state(): State {
    const view = this.get("view");
    const ready = this.get("view.ready");
    return ready ? "ready" : view ? "loading" : "disabled";
  }

  //----------------------------------
  //  view
  //----------------------------------
  view: SceneView;

  //--------------------------------------------------------------------------
  //
  //  Public Methods
  //
  //--------------------------------------------------------------------------
  goTo(bookmarkItem: BookmarkItem): IPromise<any> {
    const { view } = this;

    if (!bookmarkItem) {
      return promiseUtils.reject(new Error("BookmarkItem is required"));
    }

    if (!view) {
      return promiseUtils.reject(new Error("View is required"));
    }

    bookmarkItem.active = true;

    const goTo = view.goTo(bookmarkItem.extent);

    goTo
      .then(() => {
        bookmarkItem.active = false;
      })
      .otherwise(() => {
        bookmarkItem.active = false;
      });

    return goTo;
  }

  //--------------------------------------------------------------------------
  //
  //  Private Methods
  //
  //--------------------------------------------------------------------------

  private _viewUpdated(view: SceneView): void {
    const { _handles } = this;
    const mapHandleKey = "map";

    _handles.remove(mapHandleKey);

    if (!view) {
      return;
    }

    view.when(() => {
      _handles.add(
        watchUtils.init(view, "map", map => this._mapUpdated(map)),
        mapHandleKey
      );
    });
  }

  private _mapUpdated(map: EsriMap): void {
    if (!map) {
      return;
    }

    const { bookmarkItems } = this;
    const bookmarks = map.get<BookmarkItem[]>("bookmarks");
    bookmarkItems.removeAll();
    bookmarkItems.addMany(bookmarks);
  }
}
