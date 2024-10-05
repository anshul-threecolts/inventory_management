import moment from "moment";
import { ObjectType } from "typescript";
import WebService from "./WebService";
import { toast } from "react-toastify";
const HelperService = {
  getFormatedDateForDetail(dt: any, format?: any) {
    var stillUtc = moment.utc(dt).toDate();
    if (dt) {
      if (format) {
        return moment(stillUtc).local().format(format);
      } else {
        return moment(stillUtc)
          .local()
          .format(
            localStorage.getItem("date_format") + " hh:mm A" ??
              "DD-MM-YYYY  hh:mm A"
          );
      }
    }
  },

  isEmptyObject(data: object) {
    return Object.keys(data).length === 0;
  },
  allowOnlyNumericValue(e: any) {
    var numbers = /^[0-9]$/;
    if (!e.key.match(numbers) && e.keyCode != 8) {
      e.preventDefault();
      return false;
    }

    if (e.currentTarget.value.length > 11) {
      e.preventDefault();
      return false;
    }
  },
  allowOnlyNumericValue10(e: any) {
    var numbers = /^[0-9]$/;
    if (!e.key.match(numbers) && e.keyCode !== 8) {
      e.preventDefault();
      return false;
    }

    if (e.currentTarget.value.length > 9) {
      e.preventDefault();
      return false;
    }
  },
  maxNumber(e: any, maxNumber: number) {
    if (maxNumber && e.currentTarget.value.length > maxNumber) {
      e.preventDefault();
      return false;
    }
  },
  getRoleValue(val: string) {
    switch (val) {
      case "ADMIN":
        return "Admin";
      case "MANAGER":
        return "Manager";
      case "SERVICE_ENGINEER":
        return "Service Engineer";
      default:
        return "N/A";
    }
  },

  getPermissionValue(val: string) {
    switch (val) {
      case "VIEW":
        return "View";
      case "VIEW_EDIT":
        return "View Edit";
      case "ALL":
        return "ALL";
      default:
        return "N/A";
    }
  },
};

export default HelperService;
