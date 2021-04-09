import { PAGE_ROUTE } from 'app/config/constants';

export function getRouteFromPath(pathName: string) {
  const firstSplashIndex = pathName.indexOf('/');
  return firstSplashIndex === -1 ? PAGE_ROUTE.WELCOME_PAGE : pathName.substr(pathName.indexOf('/') + 1);
}

export function getRedirectLoginState(pathName: string, search: string, hash: string) {
  return {
    from: { pathname: getRouteFromPath(pathName), search, hash },
  };
}
