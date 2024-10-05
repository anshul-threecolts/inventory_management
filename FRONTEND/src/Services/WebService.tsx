import axios from "axios";
import { toast } from 'react-toastify';

interface PropData {
  action: string;
  body?: any;
  isFormData?: boolean;
  isShowError?: boolean;
  id?: string;
  type?: string;
  file?: any;
  key?: any;
}

const WebService = {
  getAccesstoken: function (props: PropData) {
    this.addLoader(props?.id);
    let url = this.getBaseUrl(props.type)
    return new Promise((resolve, reject) => {
      var bodyFormData = new URLSearchParams();
      for (let key in props.body) {
        bodyFormData.append(key, props.body[key]);
      }
      const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
      };
      axios
        .post(`${url}${props.action}`, bodyFormData, {
          headers: headers,
        })
        .then((response) => {
          if (typeof window !== 'undefined') {
            localStorage.setItem("token", response.data.token);
          }
          resolve(response.data);
          this.removeLoader(props?.id);
        })
        .catch((error) => {
          this.removeLoader(props?.id);
          reject(this.errorHandler(error));
        });
    });
  },

  postAPI: function <T>(props: PropData) {
    this.addLoader(props?.id);
    let url = this.getBaseUrl(props.type)
    return new Promise<T>((resolve, reject) => {
      var bodyFormData = new URLSearchParams();
      for (let key in props.body) {
        bodyFormData.append(key, props.body[key]);
      }
      axios
        .post(
          `${url}${props.action}`,
          props.isFormData ? bodyFormData : props.body,
          {
            headers: this.getHeaders(),
          }
        )
        .then((response) => {
          resolve(response.data);
          this.removeLoader(props?.id);
        })
        .catch((error) => {
          if (error && error.response && error.response.status == 401) {
            this.clearLocalStorage()
            window.location.href = "/";
          }
          this.removeLoader(props?.id);
          reject(this.errorHandler(error, props.isShowError));
        });
    });
  },

  putAPI: function (props: PropData) {
    this.addLoader(props?.id);
    let url = this.getBaseUrl(props.type)
    return new Promise((resolve, reject) => {
      var bodyFormData = new URLSearchParams();
      for (let key in props.body) {
        bodyFormData.append(key, props.body[key]);
      }
      axios
        .put(`${url}${props.action}`, props.body, {
          headers: this.getHeaders(),
        })
        .then((response) => {
          resolve(response.data);
          this.removeLoader(props?.id);
        })
        .catch((error) => {
          if (error && error.response && error.response.status == 401) {
            this.clearLocalStorage()
            window.location.href = "/";
          }
          this.removeLoader(props?.id);
          reject(this.errorHandler(error));
        });
    });
  },

  getAPI: function <T>(props: PropData) {
    let params = new URLSearchParams();
    for (let key in props.body) {
      params.set(key, props.body[key]);
    }
    this.addLoader(props?.id);
    let url = this.getBaseUrl(props.type);
    return new Promise<T>((resolve, reject) => {
      axios
        .get(`${url}${props.action}`, {
          params: params,
          headers: this.getHeaders(),
        })
        .then((response) => {
          resolve(response.data);
          this.removeLoader(props?.id);
        })
        .catch((error) => {
          if (error && error.response && error.response.status == 401) {
            this.clearLocalStorage();
            window.location.href = "/";
          }
          this.removeLoader(props?.id);
          reject(this.errorHandler(error));
        });
    });
  },

  deleteAPI: function (props: PropData) {
    this.addLoader(props?.id)
    let url = this.getBaseUrl(props.type)
    return new Promise((resolve, reject) => {
      axios
        .delete(`${url}${props.action}`, {
          headers: this.getHeaders(),
        })
        .then((response) => {
          resolve(response.data);
          this.removeLoader(props?.id)
        })
        .catch((error) => {
          if (error && error.response && error.response.status == 401) {
            this.clearLocalStorage()
            window.location.href = "/";
          }
          this.removeLoader(props?.id)
          reject(this.errorHandler(error));
        });
    });
  },

  fileUploadAPI: function (props: PropData) {
    var formData = new FormData();
    if (!props.key) {
      props.key = "file";
    }
    formData.append(props.key, props.file);
    for (let key in props.body) {
      formData.append(key, props.body[key]);
    }
    this.addLoader(props?.id);
    let url = this.getBaseUrl();
    return new Promise((resolve, reject) => {
      axios
        .post(`${url}${props.action}`, formData, {
          headers: this.getMultipartHeaders(),
        })
        .then((response) => {
          resolve(response.data);
          this.removeLoader(props?.id);
        })
        .catch((error) => {
          // props.isShowError ? reject(this.errorHandler(error)) : reject(error);
          reject(this.errorHandler(error));
          this.removeLoader(props?.id);
        });
    });
  },

  getHeaders: function () {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem("token") == null) {
        return {
          "Content-Type": "application/json"
        };
      }

      return {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("token")
      }
    }
  },

  getMultipartHeaders: function () {
    if (typeof window !== 'undefined') {
      return {
        "Authorization": "Bearer " + localStorage.getItem("token")
      };
    }
  },

  errorHandler: function (error: any, showErrorOnPopup?: boolean) {
    if (error?.response) {
      error = error.response;
    }
    var errorMessage;
    if (!error || !error.status) {
      errorMessage = "Server Not Responding";
    } else if (error.status === 401) {
      this.clearLocalStorage()
      window.location.href = "/";
    } else if (error.status === 500) {
      errorMessage =
        (error &&
          error.data &&
          error.data.ErrorDetails &&
          error.data.ErrorDetails.message) ||
        "An unkown exception has occured. Please contact to administrator";
    } else {
      errorMessage = error.data.message;

    }
    if (!showErrorOnPopup) {
      toast.error(errorMessage, { theme: "colored" });
    }
    return errorMessage;
  },

  addLoader(id: any) {
    if (id) {
      var button = document.getElementById(id) as HTMLButtonElement | null;
      if (button != null) {
        button.disabled = true;
        var loader = document.createElement("img");
        loader.src = "../images/loading.gif";
        loader.className = "button-loader";
        button.prepend(loader);
      }
    }
  },

  removeLoader(id: any) {
    if (id) {
      var button = document.getElementById(id) as HTMLButtonElement | null;
      if (button != null) {
        button.disabled = false;
        button.removeChild(button.childNodes[0]);
      }
    }
  },

  clearLocalStorage() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("token")
      localStorage.removeItem('loginUserImage')
      localStorage.removeItem('uuid')
      localStorage.removeItem('type')
    }
  },

  getBaseUrl(type?: string) {
    if (type == "home") {
      return "http://localhost:3000/";
    } else {
      return "http://localhost:3000/";
    }
  },

  
  
};


export default WebService;
