# tomsoft1 — AI Toolkit Workflow for App Developer (GitHub Packages)

**Reusable AI skills, prompts, and rules for AI-assisted Software Development Life Cycle (SDLC).**

`tomsoft1 AI Toolkit` to niewielka, wersjonowana paczka narzędzi wspierających pracę programisty z AI. Umożliwia dostarczanie tych samych skilli i reguł do różnych projektów bez ręcznego kopiowania plików.

Projekt jest demonstracją podejścia **Shared AI Registry** z modułu M5L4 kursu 10xDevs i stanowi Proof of Concept (PoC) do ścieżki **10xChampion**.

## 1. Informacje o projekcie

| Element | Wartość |
| --- | --- |
| Repozytorium | [mulatom1/ai-toolkit](https://github.com/mulatom1/ai-toolkit) |
| Nazwa projektu | **tomsoft1 — AI Toolkit Workflow for App Developer** |
| Nazwa paczki npm | `@mulatom1/tomsoft1-ai-toolkit` |
| Rejestr | [GitHub Packages](https://npm.pkg.github.com) |
| Wersja startowa nowej paczki | `0.1.0` |
| Wymagane środowisko | Node.js 20+ (zalecany Node.js 22) |
| Licencja | MIT |

> **Ważne:** Wcześniej opublikowano `@mulatom1/ai-toolkit@0.1.0`. Paczka `@mulatom1/tomsoft1-ai-toolkit` ma **inną nazwę techniczną** i jest osobnym pakietem. Sama zmiana README nie zmienia istniejącej paczki w rejestrze. Przed pierwszą publikacją pod nową nazwą sprawdź pole `name` w `package.json`. Nie traktuj publikacji nowego pakietu jako już wykonanej, dopóki nie potwierdzą jej logi GitHub Actions.

## 2. Co zawiera paczka?

- **AI skill — Code Review:** przykładowy zestaw instrukcji dla asystenta AI przeglądającego kod.
- **Wspólne reguły:** szablon reguł w `rules/CLAUDE.md`.
- **Instalator CLI:** wgrywa skill i zarządzany fragment reguł do projektu.
- **Deinstalator CLI:** usuwa zarządzane pliki, chroniąc ręcznie zmodyfikowany skill.
- **Manifest:** zapisuje informacje o plikach zarządzanych przez toolkit.
- **Testy automatyczne:** sprawdzają instalację, powtarzalność i bezpieczną deinstalację.
- **GitHub Actions:** publikuje wersjonowaną paczkę do GitHub Packages.

Na obecnym etapie jest to **mały PoC**, a nie platforma do zarządzania użytkownikami, sekretami czy wieloma zespołami.

## 3. Struktura repozytorium

```text
ai-toolkit/
├── .github/
│   └── workflows/
│       └── publish-ai-toolkit.yml
├── bin/
│   └── ai-toolkit.mjs
├── rules/
│   └── CLAUDE.md
├── skills/
│   └── code-review/
│       └── SKILL.md
├── src/
│   └── manager.mjs
├── test/
│   └── manager.test.mjs
├── .gitignore
├── LICENSE
├── package.json
└── README.md
```

## 4. Praca lokalna i testy

Sklonuj istniejące repozytorium (nie trzeba wykonywać `git init`):

```bash
git clone https://github.com/mulatom1/ai-toolkit.git
cd ai-toolkit
npm test
npm pack --dry-run
```

Przed publikacją sprawdź w `package.json`:

```json
{
  "name": "@mulatom1/tomsoft1-ai-toolkit",
  "version": "0.1.0",
  "description": "tomsoft1 AI Toolkit - reusable AI skills and rules for AI-assisted SDLC",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
```

Ten fragment pokazuje **pola do ustawienia**, a nie pełny `package.json`. Zachowaj również istniejące pola `type`, `license`, `repository`, `bin`, `files`, `scripts` i `engines`. Nazwa polecenia CLI pozostaje `ai-toolkit`, nawet jeśli nazwa paczki jest dłuższa.

Oczekiwane wyniki lokalnych kontroli:

- `npm test` — wszystkie testy przechodzą.
- `npm pack --dry-run` — w paczce znajdują się pliki potrzebne do uruchomienia toolkitu.

## 5. Publikacja w GitHub Packages

Repozytorium znajduje się na indywidualnym koncie GitHub `mulatom1`. Publikację obsługuje workflow:

`.github/workflows/publish-ai-toolkit.yml`

Workflow można uruchomić ręcznie przez **Actions → Publish AI toolkit to GitHub Packages → Run workflow**, wybierając gałąź `main`. Konfiguracja startera pozwala też uruchomić go po wypchnięciu taga `v*`.

Przed uruchomieniem publikacji:

1. Upewnij się, że `package.json` zawiera dokładnie `@mulatom1/tomsoft1-ai-toolkit` i właściwy numer wersji.
2. Uruchom `npm test` i `npm pack --dry-run`.
3. Zapisz zmiany w repozytorium:

   ```bash
   git add .
   git commit -m "feat: brand package as tomsoft1 AI Toolkit"
   git push origin main
   ```

4. Uruchom workflow **jeden raz** i sprawdź jego logi.
5. W profilu [mulatom1](https://github.com/mulatom1) otwórz sekcję **Packages** i zweryfikuj nazwę oraz opublikowaną wersję.

Przykładowy komunikat potwierdzający publikację **nowej nazwy**:

```text
+ @mulatom1/tomsoft1-ai-toolkit@0.1.0
```

**Uwaga:** GitHub Packages nie pozwala zwyczajnie nadpisać wydanej wersji tego samego pakietu. Przed kolejnym wydaniem zwiększ numer wersji, np. z `0.1.0` na `0.1.1`. Publikacja z tego workflow używa `GITHUB_TOKEN` z uprawnieniem `packages: write`; nie zapisuj własnych tokenów w repozytorium.

## 6. Instalacja w innym projekcie

### 6.1. Logowanie do GitHub Packages

GitHub npm registry wymaga uwierzytelnienia również podczas pobierania publicznych pakietów. Na komputerze programisty utwórz **Personal Access Token (classic)** z minimalnym zakresem `read:packages`, a następnie wykonaj:

```bash
npm login --scope=@mulatom1 --auth-type=legacy --registry=https://npm.pkg.github.com
```

Jako login wpisz użytkownika GitHub `mulatom1`, a jako hasło — token PAT (classic). Token przechowuj poza repozytorium. Nie wpisuj go do plików, które commitujesz.

### 6.2. Konfiguracja projektu-konsumenta

W **osobnym projekcie testowym** dodaj plik `.npmrc`:

```ini
@mulatom1:registry=https://npm.pkg.github.com
```

Ten plik zawiera tylko adres rejestru dla scope `@mulatom1`, **bez tokena**.

Zainstaluj opublikowaną paczkę:

```bash
npm install @mulatom1/tomsoft1-ai-toolkit@0.1.0
npx --no-install ai-toolkit install
```

Po udanej instalacji powinny powstać:

```text
projekt-testowy/
├── .ai-toolkit/
│   └── manifest.json
├── .claude/
│   └── skills/
│       └── code-review/
│           └── SKILL.md
└── CLAUDE.md
```

W pliku `CLAUDE.md` reguły są umieszczane pomiędzy znacznikami:

```text
<!-- ai-toolkit:start -->
...
<!-- ai-toolkit:end -->
```

### 6.3. Sprawdzenie ponownej instalacji

```bash
npx --no-install ai-toolkit install
```

Ponowna instalacja nie powinna dublować zarządzanego bloku reguł. Jeśli skill został zmieniony ręcznie, instalator nie powinien go bez pytania nadpisać.

### 6.4. Deinstalacja

```bash
npx --no-install ai-toolkit uninstall
```

Deinstalator korzysta z manifestu, usuwa zarządzany fragment `CLAUDE.md` i usuwa skill **tylko wtedy, gdy nie został zmodyfikowany ręcznie**. Gdy wykryje ręczną zmianę skilla, przerywa operację zamiast usuwać go automatycznie.

## 7. Wydawanie kolejnych wersji

Po opublikowaniu wersji `0.1.0` pod nazwą `@mulatom1/tomsoft1-ai-toolkit`:

1. Zmień zawartość wybranego skilla lub reguł i opisz zmianę w commicie.
2. Zwiększ wersję:

   ```bash
   npm version patch --no-git-tag-version
   npm test
   npm pack --dry-run
   ```

3. Wypchnij zmiany:

   ```bash
   git add .
   git commit -m "chore: release tomsoft1 AI Toolkit v0.1.1"
   git push origin main
   ```

4. Uruchom workflow ręcznie na `main` (chyba że publikację wyzwoliłeś osobno tagiem).
5. Sprawdź, czy **Packages** pokazuje obie wersje nowej paczki: `0.1.0` i `0.1.1`.

Nie uruchamiaj równocześnie publikacji ręcznej i publikacji przez tag dla tej samej wersji.

## 8. Dowody do 10xChampion (M5L4)

Projekt realizuje scenariusz **Shared AI Registry**, czyli wersjonowanie i dystrybucję zespołowych artefaktów AI. Do udokumentowania projektu przygotuj zrzuty ekranu pokazujące:

1. **Repozytorium lub rejestr** — widok repozytorium i/lub udanego workflow publikacji.
2. **Definicję paczki** — `package.json` z nazwą paczki, wersją i konfiguracją GitHub Packages.
3. **Listę wydanych wersji** — widok wersji paczki w GitHub Packages.

Dodatkowo warto zachować wynik instalacji i deinstalacji w projekcie testowym oraz zielony wynik `npm test`. To przydatny dowód działania PoC, choć nie zastępuje wskazanych wyżej trzech kategorii.

## 9. Dlaczego GitHub Packages?

Odbiorcą rozwiązania jest indywidualny programista i symulowany zespół korzystający z GitHuba. GitHub Packages pozwala publikować i wersjonować wspólne skille oraz reguły bez stawiania osobnego serwera, AWS CodeArtifact czy własnego API. Niewielka paczka, instalator oraz test w drugim projekcie pozwalają sprawdzić cały przepływ dystrybucji przy minimalnym zakresie wdrożenia.

## 10. Bezpieczeństwo i ograniczenia

- Nie przechowuj PAT ani innych sekretów w kodzie, commitowanej `.npmrc` lub logach.
- Publikuj wyłącznie własne materiały albo takie, do których masz odpowiednie prawa.
- Sprawdzaj osobno widoczność paczki w GitHub Packages — publiczne repozytorium nie oznacza automatycznie publicznej paczki.
- Narzędzie obsługuje obecnie jeden przykładowy skill `code-review` i jeden zestaw reguł; nie jest uniwersalnym menedżerem wszystkich skilli.
- Przed pracą na rzeczywistym projekcie sprawdź działanie instalacji i deinstalacji na kopii testowej.

## Licencja

Projekt jest udostępniany na licencji [MIT](./LICENSE). Licencja dotyczy kodu i artefaktów, do których autor ma prawa.
