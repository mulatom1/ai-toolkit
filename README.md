# 10xChampion — AI Toolkit (GitHub Packages)

Starter projektu do zaliczenia M5L4. Zawiera **jeden przykładowy skill**, reguły, instalator/deinstalator i workflow publikacji. **Nie został jeszcze opublikowany na GitHubie.**

## Krok 1 — konto i repozytorium GitHub

Paczka jest już dopasowana do konta indywidualnego **mulatom1**:

- Repozytorium: `https://github.com/mulatom1/ai-toolkit`
- Nazwa paczki: `@mulatom1/ai-toolkit`
- Rejestr: `https://npm.pkg.github.com`

Repozytorium `mulatom1/ai-toolkit` jest już utworzone na GitHubie, a podczas tworzenia dodano do niego licencję MIT. Ma więc już pierwszy commit. **Nie uruchamiaj `git init` ani nie próbuj nadpisywać historii repozytorium.**

1. Pobierz i rozpakuj ten starter do **osobnego** katalogu; w środku znajdziesz folder `ai-toolkit/`.
2. W terminalu, w wybranym katalogu roboczym, sklonuj istniejące repozytorium:

   ```bash
   git clone https://github.com/mulatom1/ai-toolkit.git
   ```
3. Skopiuj całą **zawartość** folderu `ai-toolkit/` ze startera do katalogu `ai-toolkit/` właśnie sklonowanego z GitHub. Zachowaj folder `.github` i plik `.gitignore`. **Nie usuwaj pliku `LICENSE`, który już jest na GitHubie.**
4. Uruchom w sklonowanym repozytorium:

   ```bash
   cd ai-toolkit
   npm test
   npm pack --dry-run
   git add .
   git commit -m "feat: initial 10xChampion AI toolkit"
   git push origin main
   ```

Przed komendą `git push` musisz być zalogowany do GitHuba przez Git Credential Manager lub GitHub CLI (`gh auth login`). Nie umieszczaj tokenów w kodzie ani adresie remote.

## Krok 2 — lokalne sprawdzenie

Potrzebny jest Node.js 20+, zalecany 22.

```bash
npm test
npm pack --dry-run
```

Możesz podmienić przykładowy skill na własny z kursu: `skills/code-review/SKILL.md`. Każdą regułę można zmienić w `rules/CLAUDE.md`.

## Krok 3 — publikacja

1. Utwórz repozytorium `ai-toolkit` na **swoim osobistym koncie GitHub** (na początek najlepiej publiczne, o ile artefakty nie zawierają danych poufnych).
2. Wypchnij pliki startera do gałęzi `main`.
3. W **Actions** uruchom ręcznie workflow **Publish AI toolkit to GitHub Packages** przez `Run workflow` na gałęzi `main` (publikuje wersję `0.1.0`).
4. W zakładce profilu GitHub `Packages` sprawdź paczkę `ai-toolkit`.
5. Zmień wersję w `package.json` na `0.1.1`, wykonaj drobną zmianę w skillu, wypchnij zmiany i uruchom workflow ponownie.
6. Zrób screenshoty: repozytorium lub widok workflow; definicja `package.json`; lista opublikowanych wersji. Jeśli paczka nie pokazuje się przy repozytorium, sprawdź zakładkę **Packages** na profilu `mulatom1`.

**Uwaga:** GitHub Packages nie pozwala opublikować tej samej wersji dwukrotnie (błąd 409). Nie uruchamiaj ponownie publikacji bez zmiany wersji. Publikacja z GitHub Actions korzysta z automatycznego `GITHUB_TOKEN` i `packages: write`; nie potrzebuje ręcznie tworzonego PAT. Przy pierwszej publikacji paczka może być prywatna domyślnie, nawet jeśli repo jest publiczne — sprawdź osobno jej widoczność.

## Krok 4 — użycie paczki w projekcie testowym

Na komputerze dewelopera GitHub npm registry wymaga logowania także do odczytu publicznych pakietów. Utwórz osobisty token **classic** z minimalnym zakresem `read:packages`, a następnie:

```bash
npm login --scope=@mulatom1 --auth-type=legacy --registry=https://npm.pkg.github.com
# Login: nazwa użytkownika GitHub; hasło: PAT classic
```

W osobnym projekcie testowym utwórz `.npmrc` zawierające **tylko**:

```
@mulatom1:registry=https://npm.pkg.github.com
```

Zainstaluj paczkę i uruchom dostarczony przez nią instalator:

```bash
npm install @mulatom1/ai-toolkit@0.1.0
npx ai-toolkit install
```

Po wykonaniu powstaną `.claude/skills/code-review/SKILL.md` oraz zarządzany blok w `CLAUDE.md`. Uruchom `npx ai-toolkit install` ponownie — reguły nie powinny się zduplikować. Aby usunąć zarządzane pliki:

```bash
npx ai-toolkit uninstall
```

Deinstalator nie usuwa ręcznie zmodyfikowanych skilli. Nie wpisuj PAT do repozytorium ani do commitowanej `.npmrc`.

## Uzasadnienie wyboru dla M5L4

Odbiorcą jest pojedynczy programista i symulowany zespół korzystający z GitHub. GitHub Packages zapewnia wersjonowanie i dystrybucję skilli bez osobnego serwera, AWS ani własnego API. Na potrzeby PoC publikujemy małą paczkę, testujemy instalację w drugim repo i dokumentujemy wydane wersje.
