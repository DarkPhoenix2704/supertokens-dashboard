/* Copyright (c) 2022, VRAI Labs and/or its affiliates. All rights reserved.
 *
 * This software is licensed under the Apache License, Version 2.0 (the
 * "License") as published by the Apache Software Foundation.
 *
 * You may not use this file except in compliance with the License. You may
 * obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

import { UserWithRecipeId } from "../../ui/pages/usersList/types";
import { getApiUrl, getConnectionUri, isUsingDemoConnectionUri, obfuscatePhone, useFetchData } from "../../utils";

interface IUseUserService {
	updateUserInformation: (args: IUpdateUserInformationArgs) => Promise<UpdateUserInformationResponse>;
	getUser: (userId: string, recipeId: string) => Promise<GetUserInfoResult>;
}

interface IUpdateUserInformationArgs {
	userId: string;
	recipeId: string;
	email?: string;
	phone?: string;
	firstName?: string;
	lastName?: string;
}

export type GetUserInfoResult =
	| {
			status: "NO_USER_FOUND_ERROR";
	  }
	| {
			status: "RECIPE_NOT_INITIALISED";
	  }
	| {
			status: "OK";
			user: UserWithRecipeId;
	  };

export type UpdateUserInformationResponse =
	| {
			status: "OK" | "EMAIL_ALREADY_EXISTS_ERROR" | "PHONE_ALREADY_EXISTS_ERROR";
	  }
	| {
			status: "INVALID_EMAIL_ERROR" | "INVALID_PHONE_ERROR";
			error: string;
	  };

export const useUserService = (): IUseUserService => {
	const fetchData = useFetchData();

	const getUser = async (userId: string, recipeId: string): Promise<GetUserInfoResult> => {
		const response = await fetchData({
			url: getApiUrl("/api/user"),
			method: "GET",
			query: {
				userId,
				recipeId,
			},
		});

		if (response.ok) {
			const body = await response.json();

			if (body.status === "NO_USER_FOUND_ERROR") {
				return {
					status: "NO_USER_FOUND_ERROR",
				};
			}

			if (body.status === "RECIPE_NOT_INITIALISED") {
				return {
					status: "RECIPE_NOT_INITIALISED",
				};
			}

			if (isUsingDemoConnectionUri(getConnectionUri())) {
				if (body?.user?.phoneNumber) {
					body.user.phoneNumber = obfuscatePhone(body.user.phoneNumber);
				}
				if (body?.user?.email) {
					body.user.email = "johndoe@supertokens.com";
				}
			}

			return {
				status: "OK",
				user: body,
			};
		}

		return {
			status: "NO_USER_FOUND_ERROR",
		};
	};

	const updateUserInformation = async ({
		userId,
		recipeId,
		email,
		phone,
		firstName,
		lastName,
	}: IUpdateUserInformationArgs): Promise<UpdateUserInformationResponse> => {
		let emailToSend = email === undefined ? "" : email;
		const phoneToSend = phone === undefined ? "" : phone;
		const firstNameToSend = firstName === undefined ? "" : firstName;
		const lastNameToSend = lastName === undefined ? "" : lastName;

		if (recipeId === "thirdparty") {
			emailToSend = "";
		}

		const response = await fetchData({
			url: getApiUrl("/api/user"),
			method: "PUT",
			config: {
				body: JSON.stringify({
					recipeId,
					userId,
					phone: phoneToSend,
					email: emailToSend,
					firstName: firstNameToSend,
					lastName: lastNameToSend,
				}),
			},
		});

		return await response.json();
	};

	return {
		updateUserInformation,
		getUser,
	};
};

export default useUserService;
