'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">
                        <img alt="" class="img-responsive" data-type="custom-logo" data-src="images/polaris-logo.svg">
                    </a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#components-links"' :
                            'data-bs-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>Components</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/$PolarisTimePickerDialog.html" data-type="entity-link" >$PolarisTimePickerDialog</a>
                            </li>
                            <li class="link">
                                <a href="components/PolarisAccordion.html" data-type="entity-link" >PolarisAccordion</a>
                            </li>
                            <li class="link">
                                <a href="components/PolarisBadge.html" data-type="entity-link" >PolarisBadge</a>
                            </li>
                            <li class="link">
                                <a href="components/PolarisButton.html" data-type="entity-link" >PolarisButton</a>
                            </li>
                            <li class="link">
                                <a href="components/PolarisCheckbox.html" data-type="entity-link" >PolarisCheckbox</a>
                            </li>
                            <li class="link">
                                <a href="components/PolarisCheckboxGroup.html" data-type="entity-link" >PolarisCheckboxGroup</a>
                            </li>
                            <li class="link">
                                <a href="components/PolarisChip.html" data-type="entity-link" >PolarisChip</a>
                            </li>
                            <li class="link">
                                <a href="components/PolarisChipList.html" data-type="entity-link" >PolarisChipList</a>
                            </li>
                            <li class="link">
                                <a href="components/PolarisDatePicker.html" data-type="entity-link" >PolarisDatePicker</a>
                            </li>
                            <li class="link">
                                <a href="components/PolarisDialog.html" data-type="entity-link" >PolarisDialog</a>
                            </li>
                            <li class="link">
                                <a href="components/PolarisDivider.html" data-type="entity-link" >PolarisDivider</a>
                            </li>
                            <li class="link">
                                <a href="components/PolarisExpansionPanel.html" data-type="entity-link" >PolarisExpansionPanel</a>
                            </li>
                            <li class="link">
                                <a href="components/PolarisFilePicker.html" data-type="entity-link" >PolarisFilePicker</a>
                            </li>
                            <li class="link">
                                <a href="components/PolarisHeading.html" data-type="entity-link" >PolarisHeading</a>
                            </li>
                            <li class="link">
                                <a href="components/PolarisHref.html" data-type="entity-link" >PolarisHref</a>
                            </li>
                            <li class="link">
                                <a href="components/PolarisIcon.html" data-type="entity-link" >PolarisIcon</a>
                            </li>
                            <li class="link">
                                <a href="components/PolarisIconButton.html" data-type="entity-link" >PolarisIconButton</a>
                            </li>
                            <li class="link">
                                <a href="components/PolarisInput.html" data-type="entity-link" >PolarisInput</a>
                            </li>
                            <li class="link">
                                <a href="components/PolarisLoader.html" data-type="entity-link" >PolarisLoader</a>
                            </li>
                            <li class="link">
                                <a href="components/PolarisNotification.html" data-type="entity-link" >PolarisNotification</a>
                            </li>
                            <li class="link">
                                <a href="components/PolarisPaginator.html" data-type="entity-link" >PolarisPaginator</a>
                            </li>
                            <li class="link">
                                <a href="components/PolarisRadioGroup.html" data-type="entity-link" >PolarisRadioGroup</a>
                            </li>
                            <li class="link">
                                <a href="components/PolarisRichTextEditor.html" data-type="entity-link" >PolarisRichTextEditor</a>
                            </li>
                            <li class="link">
                                <a href="components/PolarisSearchBar.html" data-type="entity-link" >PolarisSearchBar</a>
                            </li>
                            <li class="link">
                                <a href="components/PolarisSelect.html" data-type="entity-link" >PolarisSelect</a>
                            </li>
                            <li class="link">
                                <a href="components/PolarisStatusIcon.html" data-type="entity-link" >PolarisStatusIcon</a>
                            </li>
                            <li class="link">
                                <a href="components/PolarisTabBar.html" data-type="entity-link" >PolarisTabBar</a>
                            </li>
                            <li class="link">
                                <a href="components/PolarisTable.html" data-type="entity-link" >PolarisTable</a>
                            </li>
                            <li class="link">
                                <a href="components/PolarisTableBaseCell.html" data-type="entity-link" >PolarisTableBaseCell</a>
                            </li>
                            <li class="link">
                                <a href="components/PolarisTableDateCell.html" data-type="entity-link" >PolarisTableDateCell</a>
                            </li>
                            <li class="link">
                                <a href="components/PolarisTextarea.html" data-type="entity-link" >PolarisTextarea</a>
                            </li>
                            <li class="link">
                                <a href="components/PolarisTimePicker.html" data-type="entity-link" >PolarisTimePicker</a>
                            </li>
                            <li class="link">
                                <a href="components/PolarisTooltip.html" data-type="entity-link" >PolarisTooltip</a>
                            </li>
                            <li class="link">
                                <a href="components/PolarisUiBase.html" data-type="entity-link" >PolarisUiBase</a>
                            </li>
                            <li class="link">
                                <a href="components/PolarisUiFormBase.html" data-type="entity-link" >PolarisUiFormBase</a>
                            </li>
                            <li class="link">
                                <a href="components/ThemeSwitcherComponent.html" data-type="entity-link" >ThemeSwitcherComponent</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#directives-links"' :
                                'data-bs-target="#xs-directives-links"' }>
                                <span class="icon ion-md-code-working"></span>
                                <span>Directives</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="directives-links"' : 'id="xs-directives-links"' }>
                                <li class="link">
                                    <a href="directives/PolarisTableCustomCellDirective.html" data-type="entity-link" >PolarisTableCustomCellDirective</a>
                                </li>
                                <li class="link">
                                    <a href="directives/PolarisTableCustomHeaderRowDirective.html" data-type="entity-link" >PolarisTableCustomHeaderRowDirective</a>
                                </li>
                                <li class="link">
                                    <a href="directives/PolarisTooltipDirective.html" data-type="entity-link" >PolarisTooltipDirective</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/ButtonConfig.html" data-type="entity-link" >ButtonConfig</a>
                            </li>
                            <li class="link">
                                <a href="classes/PolarisChipListItem.html" data-type="entity-link" >PolarisChipListItem</a>
                            </li>
                            <li class="link">
                                <a href="classes/PolarisGroupOption.html" data-type="entity-link" >PolarisGroupOption</a>
                            </li>
                            <li class="link">
                                <a href="classes/PolarisNavigationTabConfig.html" data-type="entity-link" >PolarisNavigationTabConfig</a>
                            </li>
                            <li class="link">
                                <a href="classes/PolarisSearchBarCategoryResult.html" data-type="entity-link" >PolarisSearchBarCategoryResult</a>
                            </li>
                            <li class="link">
                                <a href="classes/PolarisSearchBarResult.html" data-type="entity-link" >PolarisSearchBarResult</a>
                            </li>
                            <li class="link">
                                <a href="classes/PolarisTableColumnConfig.html" data-type="entity-link" >PolarisTableColumnConfig</a>
                            </li>
                            <li class="link">
                                <a href="classes/PolarisTableConfig.html" data-type="entity-link" >PolarisTableConfig</a>
                            </li>
                            <li class="link">
                                <a href="classes/PolarisTablePagination.html" data-type="entity-link" >PolarisTablePagination</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/PolarisDialogService.html" data-type="entity-link" >PolarisDialogService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PolarisNotificationService.html" data-type="entity-link" >PolarisNotificationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ThemeService.html" data-type="entity-link" >ThemeService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/INotificationData.html" data-type="entity-link" >INotificationData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/INotificationOptions.html" data-type="entity-link" >INotificationOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PolarisFilePickerFile.html" data-type="entity-link" >PolarisFilePickerFile</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PolarisFilePickerFileType.html" data-type="entity-link" >PolarisFilePickerFileType</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PolarisNavigationTab.html" data-type="entity-link" >PolarisNavigationTab</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PolarisRichTextEditorOptions.html" data-type="entity-link" >PolarisRichTextEditorOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PolarisTooltipContext.html" data-type="entity-link" >PolarisTooltipContext</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Window.html" data-type="entity-link" >Window</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});