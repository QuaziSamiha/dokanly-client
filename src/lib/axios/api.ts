import axiosInstance from "./axios";

export interface IPostAPI<T> {
  endpoint: string;
  payload: T;
}

export const postAPI = <T>({ endpoint, payload }: IPostAPI<T>) => {
  return axiosInstance.post(endpoint, payload);
};

export const getAPI = async (endpoint: string) => {
  try {
    const response = await axiosInstance.get(endpoint);
    // console.log(response);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};
