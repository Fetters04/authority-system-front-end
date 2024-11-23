import Cookies from 'js-cookie'

const TokenKey = 'Admin-Token'

/**
 * 获取 token
 * @returns
 */
export function getToken() {
  return Cookies.get(TokenKey)
}

/**
 * 设置 token
 * @returns
 */
export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

/**
 * 删除 token
 * @returns {*}
 */
export function removeToken() {
  return Cookies.remove(TokenKey)
}

/**
 * 清空sessionStorage
 */
export function clearStorage(){
  return sessionStorage.clear();
}
