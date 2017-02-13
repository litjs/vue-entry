export default function (i18n) {
  let cn = {}
  let en = {}
  Object.keys(i18n).forEach(function (item) {
    let cnObj = {}
    let enObj = {}
    cnObj[item] = i18n[item]['default']['cn']
    enObj[item] = i18n[item]['default']['en']
    $.extend(cn, cnObj)
    $.extend(en, enObj)
  })

  return {cn: cn, en: en}
}