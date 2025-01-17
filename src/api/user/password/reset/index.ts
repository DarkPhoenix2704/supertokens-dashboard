import { getApiUrl, useFetchData } from "../../../../utils";

interface IUsePasswordResetService {
	updatePassword: (userId: string, newPassword: string) => Promise<UpdatePasswordResponse>;
}

type UpdatePasswordResponse =
	| {
			status: "OK";
	  }
	| {
			status: "INVALID_PASSWORD_ERROR";
			error: string;
	  };

const usePasswordResetService = (): IUsePasswordResetService => {
	const fetchData = useFetchData();

	const updatePassword = async (userId: string, newPassword: string): Promise<UpdatePasswordResponse> => {
		const response = await fetchData({
			url: getApiUrl("/api/user/password"),
			method: "PUT",
			query: { userId },
			config: {
				body: JSON.stringify({
					userId,
					newPassword,
				}),
			},
		});
		return await response.json();
	};

	return { updatePassword };
};

export default usePasswordResetService;
