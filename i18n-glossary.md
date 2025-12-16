# Inbox Arena - i18n Glossary (Latvia v1)

## Quality Bar
For Latvian and Russian, the standard is:
- **Reads as native** - natural phrasing, not literal word-for-word translation
- **Technically accurate** - security terms are correct and consistent
- **Consistent tone** - clear, calm, professional, learner-friendly
- **Culturally fluent** - examples and microcopy feel local and appropriate
- **Polished UI fit** - no awkward truncation or broken layouts

## Key Convention
All translation keys follow the pattern: `feature.screen.element.state`

Examples:
- `header.dashboard` - Header component, dashboard link
- `training.actions.report` - Training feature, actions section, report button
- `dashboard.stats.detectionRate` - Dashboard feature, stats section, detection rate label
- `training.feedback.correct` - Training feature, feedback section, correct state

## Do-Not-Translate Tokens
Use these exactly as shown (keep in English):
- Wi-Fi, VPN, IP, MAC, SSID, HTTP, HTTPS, TLS, NAT, IoT
- BEC (Business Email Compromise)
- NIST

If you need to explain once (tooltip or first mention):
- LV: "pikšķerēšanas uzbrukums (phishing)"
- RU: "фишинговая атака (phishing)"

## Locked Term Translations

| English (Canonical) | Latvian (LV) | Russian (RU) | Notes |
|---------------------|--------------|--------------|-------|
| Phishing | pikšķerēšana | фишинг | Core term |
| Risk | risks | риск | Used in scoring |
| Risk score | riska vērtējums | оценка риска | Dashboard metric |
| Report | ziņot / ziņojums | сообщить / отчёт | Action vs noun |
| Malicious | ļaunprātīgs | вредоносный | For threats |
| Legitimate | likumīgs / īsts | легитимный | For safe content |
| Threat | drauds | угроза | Security term |
| Security | drošība | безопасность | Core term |
| Encryption | šifrēšana | шифрование | Technical term |
| Device | ierīce | устройство | General term |
| Training | apmācība | обучение | Core feature |
| Dashboard | panelis | панель | Navigation |
| Shift | maiņa | смена | Gameplay session |
| Message | ziņojums | сообщение | Inbox item |
| Inbox | iesūtne | входящие | Email context |
| Verify | pārbaudīt | проверить | Action button |
| Delete | dzēst | удалить | Action button |
| Proceed | turpināt | продолжить | Action button (risky) |
| Confidence | pārliecība | уверенность | Self-assessment |
| Score | vērtējums / punkti | оценка / баллы | Metric |
| Accuracy | precizitāte | точность | Metric |
| Detection | atklāšana | обнаружение | Security metric |

## Microcopy Locks (UI Consistency)

| English | Latvian (LV) | Russian (RU) |
|---------|--------------|--------------|
| Start | Sākt | Начать |
| Continue | Turpināt | Продолжить |
| Learn more | Uzzināt vairāk | Подробнее |
| Back | Atpakaļ | Назад |
| Reset | Atiestatīt | Сбросить |
| Sign In | Ielogoties | Войти |
| Sign Out | Izrakstīties | Выйти |
| Save | Saglabāt | Сохранить |
| Cancel | Atcelt | Отмена |
| Confirm | Apstiprināt | Подтвердить |
| Close | Aizvērt | Закрыть |

## ICU Pluralization Notes

### Russian Plurals
Russian has complex plural forms (one, few, many, other):
```
{count, plural, 
  one {# проверка осталась} 
  few {# проверки осталось} 
  many {# проверок осталось} 
  other {# проверок осталось}
}
```

### Latvian Plurals
Latvian uses simpler forms (one, other):
```
{count, plural, 
  one {# verifikācija atlikusi} 
  other {# verifikācijas atlikušas}
}
```

## Guardrails

1. **Use ICU plurals/selects** - No handmade plural logic
2. **Avoid sentence Lego** - No concatenating fragments like "Hello " + name
3. **Use Intl.\*** - For dates/numbers (Latvia/Russia formatting differs from US)
4. **Glossary updates** - If a translator wants to change a locked term, it must be a deliberate glossary update, not a one-off variation

## Fallback Chain
- User preference → Browser locale → lv (default) → en (final fallback)

English is the source locale and maintained as canonical. Latvian is the runtime default for Latvia v1 launch.
