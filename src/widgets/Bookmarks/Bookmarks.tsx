import watchUtils from "esri/core/watchUtils";

import Widget from "esri/widgets/Widget";
import {
  aliasOf,
  declared,
  property,
  subclass
} from "esri/core/accessorSupport/decorators";
import Handles from "esri/core/Handles";
import SceneView from "esri/views/SceneView";
import {
  accessibleHandler,
  cssTransition,
  renderable,
  tsx
} from "esri/widgets/support/widget";
import BookmarksViewModel from "@/widgets/Bookmarks/BookmarksViewModel";
import BookmarkItem from "@/widgets/Bookmarks/BookmarkItem";

const CSS = {
  base: "TGIS-bookmarks",
  loading: "TGIS-bookmarks__loading",
  loadingIcon: "esri-icon-loading-indicator esri-rotating",
  fadeIn: "TGIS-bookmarks--fade-in",
  iconClass: "esri-icon-labels",
  bookmarkList: "TGIS-bookmarks__list",
  bookmarkItem: "TGIS-bookmarks__item",
  bookmarkItemIcon: "TGIS-bookmarks__item-icon",
  bookmarkItemName: "TGIS-bookmarks__item-name",
  bookmarkItemActive: "TGIS-bookmarks__item--active"
};

@subclass("TGIS.Bookmarks")
export default class Bookmarks extends declared(Widget) {
  //--------------------------------------------------------------------------
  //
  //  Lifecycle
  //
  //--------------------------------------------------------------------------
  constructor(params?: any) {
    super();
    console.log(params);
  }

  postInitialize(): void {
    this.own(
      watchUtils.on(this, "viewModel.bookmarkItems", "change", () =>
        this._bookmarkItemsChanged()
      )
    );

    this._bookmarkItemsChanged();
  }

  //--------------------------------------------------------------------------
  //
  //  Variables
  //
  //--------------------------------------------------------------------------
  _handles: Handles = new Handles();

  //--------------------------------------------------------------------------
  //
  //  Properties
  //
  //--------------------------------------------------------------------------

  //----------------------------------
  //  iconClass
  //----------------------------------
  @property() iconClass = CSS.iconClass;

  //----------------------------------
  //  label
  //----------------------------------
  @property() label: string = "书签";

  //----------------------------------
  //  view
  //----------------------------------
  @aliasOf("viewModel.view") view: SceneView;

  //----------------------------------
  //  viewModel
  //----------------------------------
  @property({
    type: BookmarksViewModel
  })
  @renderable(["state"])
  viewModel: BookmarksViewModel = new BookmarksViewModel();

  //--------------------------------------------------------------------------
  //
  //  Public Methods
  //
  //--------------------------------------------------------------------------
  render() {
    const fadeInAnimation = cssTransition("enter", CSS.fadeIn);

    const loadingNode = (
      <div class={CSS.loading}>
        <span class={CSS.loadingIcon} />
      </div>
    );

    const bookmarkNodes = this._renderBookmarks();
    const { state } = this.viewModel;

    const bookmarkListNode =
      state === "ready" && bookmarkNodes.length
        ? [
            <ul enterAnimation={fadeInAnimation} class={CSS.bookmarkList}>
              {bookmarkNodes}
            </ul>
          ]
        : state === "loading"
          ? loadingNode
          : null;

    return <div class={CSS.base}>{bookmarkListNode}</div>;
  }

  //--------------------------------------------------------------------------
  //
  //  Private Methods
  //
  //--------------------------------------------------------------------------
  private _renderBookmarks(): any {
    const { bookmarkItems } = this.viewModel;
    return bookmarkItems.toArray().map(bookmarkItem => {
      this._renderBookmark(bookmarkItem);
    });
  }

  private _renderBookmark(bookmarkItem: BookmarkItem): any {
    const { name, active } = bookmarkItem;

    const bookmarkItemClasses = {
      [CSS.bookmarkItemActive]: active
    };

    return (
      <li
        bind={this}
        data-bookmark-item={bookmarkItem}
        class={this.classes(CSS.bookmarkItem, bookmarkItemClasses)}
        onclick={this._goToBookmark}
        onkeydown={this._goToBookmark}
        tabindex={0}
        role="button"
        aria-label={name}
      >
        <span class={this.classes(CSS.iconClass, CSS.bookmarkItemIcon)} />
        <span class={CSS.bookmarkItemName}>{name}</span>
      </li>
    );
  }

  private _bookmarkItemsChanged(): void {
    const itemKey = "items";
    const { bookmarkItems } = this.viewModel;
    const { _handles } = this;

    _handles.remove(itemKey);
    const handles = bookmarkItems.map(bookmarkItem => {
      return watchUtils.watch(bookmarkItem, ["active", "name"], () =>
        this.scheduleRender()
      );
    });
    _handles.add(handles, itemKey);
    this.scheduleRender();
  }

  @accessibleHandler()
  private _goToBookmark(event: Event): void {
    const node = event.currentTarget as Element;
    const bookmarkItem = node["data-bookmark-item"] as BookmarkItem;
    this.viewModel.goTo(bookmarkItem);
  }
}
