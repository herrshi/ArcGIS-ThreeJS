import {
  declared,
  subclass
} from "esri/core/accessorSupport/decorators";
import { tsx } from "esri/widgets/support/widget";
import Widget from "esri/widgets/Widget";

@subclass("TGIS.Widgets.Demo")
class DemoWidget extends declared(Widget){
  constructor(params?: any) {
    super(params);
    console.log("widget create");
  }

  render() {
    return(
      <div>demo</div>
    );
  }
}

export default DemoWidget;
