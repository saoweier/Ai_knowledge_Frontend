// utils/cookie.js - Cookie管理工具类

/**
 * 设置Cookie
 * @param {string} name - Cookie名称
 * @param {string} value - Cookie值
 * @param {number} minutes - 有效期(分钟)
 */
export function setCookie(name, value, minutes) {
  const date = new Date()
  date.setTime(date.getTime() + minutes * 60 * 1000)
  const expires = `expires=${date.toUTCString()}`
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`
}

/**
 * 获取Cookie
 * @param {string} name - Cookie名称
 * @returns {string|null} Cookie值
 */
export function getCookie(name) {
  const nameEQ = `${name}=`
  const cookies = document.cookie.split(';')
  
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim()
    if (cookie.indexOf(nameEQ) === 0) {
      return cookie.substring(nameEQ.length)
    }
  }
  return null
}

/**
 * 删除Cookie
 * @param {string} name - Cookie名称
 */
export function deleteCookie(name) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
}

/**
 * 刷新Cookie过期时间
 * @param {string} name - Cookie名称
 * @param {number} minutes - 新的有效期(分钟)
 */
export function refreshCookie(name, minutes) {
  const value = getCookie(name)
  if (value) {
    setCookie(name, value, minutes)
    return true
  }
  return false
}

/**
 * 检查Cookie是否存在
 * @param {string} name - Cookie名称
 * @returns {boolean}
 */
export function hasCookie(name) {
  return getCookie(name) !== null
}