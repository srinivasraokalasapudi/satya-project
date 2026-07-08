import { useDispatch } from "react-redux";
import { getUserData } from "../https";
import { useEffect, useState } from "react";
import { removeUser, setUser } from "../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";

const useLoadData = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // A slow/sleeping backend (Render free tier can take 15-20s to wake
    // up) means this initial "am I logged in" check can still be in
    // flight after the user has already tapped logout. If we don't
    // guard against that, this stale response resolves later and
    // silently re-authenticates the user with dispatch(setUser(...)),
    // which looks like "logout doesn't work" / the app bouncing back
    // to Home on its own a few seconds after logging out.
    let cancelled = false;

    const fetchUser = async () => {
      try {
        const { data } = await getUserData();
        console.log(data);

        // If the user logged out (or this hook's owner unmounted)
        // while this request was pending, don't apply a stale result.
        if (cancelled || !localStorage.getItem("accessToken")) return;

        const { _id, name, email, phone, role } = data.data;
        dispatch(setUser({ _id, name, email, phone, role }));
      } catch (error) {
        if (cancelled) return;
        localStorage.removeItem("accessToken");
        dispatch(removeUser());
        navigate("/auth");
        console.log(error);
      }finally{
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchUser();

    return () => {
      cancelled = true;
    };
  }, [dispatch, navigate]);

  return isLoading;
};

export default useLoadData;
