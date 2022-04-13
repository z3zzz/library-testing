interface LoggginSuccessAction {
  type: "LOGIN_SUCCESS";
  payload: {
    name: string;
    email: string;
    password: string;
  };
}

interface LogoutAction {
  type: "LOGOUT";
}

type Action = LoggginSuccessAction | LogoutAction;
type State = {
  user: {
    name: string;
    email: string;
    password: string;
  };
};

export function loginReducer(state: State = null, action: Action) {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      console.log("%c로그인!", "color: #d93d1a;");
      return {
        ...state,
        user: action.payload,
      };
    case "LOGOUT":
      console.log("%c로그아웃!", "color: #d93d1a;");
      return {
        ...state,
        user: null,
      };
    default:
      return state;
  }
}
