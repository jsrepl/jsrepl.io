let _maybeRussia: boolean | undefined

function maybeRussia(): boolean {
  if (_maybeRussia === undefined) {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const russianTimeZones = [
      'Europe/Kaliningrad',
      'Europe/Moscow',
      'Europe/Volgograd',
      'Europe/Samara',
      'Asia/Yekaterinburg',
      'Asia/Omsk',
      'Asia/Krasnoyarsk',
      'Asia/Irkutsk',
      'Asia/Yakutsk',
      'Asia/Vladivostok',
      'Asia/Magadan',
      'Asia/Sakhalin',
      'Asia/Kamchatka',
      'Asia/Chita',
      'Asia/Anadyr',
      'Asia/Ust-Nera',
      'Asia/Khandyga',
      'Asia/Novosibirsk',
      'Asia/Tomsk',
      'Asia/Barnaul',
    ]

    _maybeRussia = russianTimeZones.includes(timeZone)
  }

  return _maybeRussia
}

// Russia’s internet watchdog (Roskomnadzor) blocks Cloudflare’s security feature
// called Encrypted Client Hello (ECH), which seems to affect esm.sh as well - it works
// very unstable and often times out.
// As a temporary workaround, we use esm.sh proxy for users in Russia.
// https://therecord.media/russia-blocks-thousands-of-websites-that-use-cloudflare-service
export function resolvePackageProvider(provider: 'auto' | 'esm.sh' | 'esm.sh-proxy') {
  if (provider === 'auto') {
    provider = maybeRussia() ? 'esm.sh-proxy' : 'esm.sh'
  }

  return provider
}

const providerUrls = {
  'esm.sh': 'https://esm.sh',
  'esm.sh-proxy': 'https://esmshproxy.jsrepl.io',
}

export function getProviderUrl(provider: 'auto' | 'esm.sh' | 'esm.sh-proxy') {
  const resolvedProvider = resolvePackageProvider(provider)
  return providerUrls[resolvedProvider]
}

export function getPackageUrl(provider: 'auto' | 'esm.sh' | 'esm.sh-proxy', packageName: string) {
  const providerUrl = getProviderUrl(provider)
  return providerUrl + '/' + packageName
}
