<?php

namespace Drupal\ahm_supabase_sync\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

class SettingsForm extends ConfigFormBase {

  protected function getEditableConfigNames(): array {
    return ['ahm_supabase_sync.settings'];
  }

  public function getFormId(): string {
    return 'ahm_supabase_sync_settings';
  }

  public function buildForm(array $form, FormStateInterface $form_state): array {
    $config = $this->config('ahm_supabase_sync.settings');

    $form['supabase_url'] = [
      '#type'          => 'textfield',
      '#title'         => $this->t('Supabase URL'),
      '#default_value' => $config->get('supabase_url'),
      '#required'      => TRUE,
    ];

    $form['supabase_service_role_key'] = [
      '#type'          => 'textfield',
      '#title'         => $this->t('Supabase service role key'),
      '#default_value' => $config->get('supabase_service_role_key'),
      '#required'      => TRUE,
      '#maxlength'     => 512,
    ];

    return parent::buildForm($form, $form_state);
  }

  public function submitForm(array &$form, FormStateInterface $form_state): void {
    $this->config('ahm_supabase_sync.settings')
      ->set('supabase_url', trim($form_state->getValue('supabase_url')))
      ->set('supabase_service_role_key', trim($form_state->getValue('supabase_service_role_key')))
      ->save();

    parent::submitForm($form, $form_state);
  }

}
